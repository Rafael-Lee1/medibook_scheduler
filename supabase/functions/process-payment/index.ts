
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Set up Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function generateInvoice(payment: any, appointmentDetails: any, userProfile: any) {
  // For now, we'll just create a simple invoice URL with the payment ID
  // In a real app, you would generate a PDF or HTML invoice and store it
  
  // For free payments, we don't generate an invoice
  if (payment.payment_method === "free") {
    return null;
  }
  
  const invoiceUrl = `${supabaseUrl}/storage/v1/object/public/invoices/${payment.id}.html`;
  
  console.log(`Generated invoice URL: ${invoiceUrl}`);
  return invoiceUrl;
}

async function sendPaymentConfirmationEmail(userEmail: string, userName: string, paymentDetails: any, appointmentDetails: any) {
  try {
    const isFree = paymentDetails.payment_method === "free";
    const emailSubject = isFree ? "Exam Released - MediBook" : "Payment Confirmation - MediBook";
    
    const emailContent = `
      <h1>${isFree ? 'Exam Released' : 'Payment Confirmed'}</h1>
      <p>Dear ${userName},</p>
      <p>${isFree ? 'Your exam has been released for free.' : `Thank you for your payment of $${paymentDetails.amount} for your medical exam.`}</p>
      <h2>Appointment Details:</h2>
      <ul>
        <li>Exam: ${appointmentDetails.exam_name}</li>
        <li>Laboratory: ${appointmentDetails.laboratory_name}</li>
        <li>Date: ${appointmentDetails.appointment_date}</li>
        <li>Time: ${appointmentDetails.appointment_time}</li>
      </ul>
      ${!isFree ? `
      <h2>Payment Details:</h2>
      <ul>
        <li>Amount: $${paymentDetails.amount}</li>
        <li>Payment Method: ${paymentDetails.payment_method}</li>
        <li>Transaction ID: ${paymentDetails.transaction_id || 'N/A'}</li>
        <li>Payment Date: ${new Date(paymentDetails.payment_date).toLocaleString()}</li>
      </ul>
      ${paymentDetails.invoice_url ? `<p>You can view your invoice by clicking <a href="${paymentDetails.invoice_url}">here</a>.</p>` : ''}
      ` : ''}
      <p>Thank you for choosing MediBook for your medical exams.</p>
    `;
    
    console.log("Sending email to:", userEmail);
    console.log("Email subject:", emailSubject);
    
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MediBook <no-reply@resend.dev>",
        to: userEmail,
        subject: emailSubject,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error sending email:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    const responseData = await response.json();
    console.log("Email sent successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("Error in sendPaymentConfirmationEmail:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }

  try {
    const requestData = await req.json();
    const { appointmentId, paymentMethod, amount, userId } = requestData;

    console.log(`Processing payment for appointment ${appointmentId}`);
    console.log(`Payment method: ${paymentMethod}, Amount: ${amount}`);

    // 1. Get appointment details
    const { data: appointmentData, error: appointmentError } = await supabase
      .from("appointments")
      .select(`
        id,
        appointment_date,
        appointment_time,
        laboratory_exam_id,
        laboratory_exams (
          id,
          laboratories (id, name),
          exams (id, name, price)
        )
      `)
      .eq("id", appointmentId)
      .single();

    if (appointmentError) {
      console.error("Error fetching appointment:", appointmentError);
      throw appointmentError;
    }

    // 2. Get user profile
    const { data: userProfile, error: userError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user profile:", userError);
      throw userError;
    }

    console.log("User profile:", userProfile);

    // 3. Generate a transaction ID (in real app, this would come from payment processor)
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 4. Create payment record
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        appointment_id: appointmentId,
        amount: amount,
        payment_method: paymentMethod,
        payment_status: "completed",
        transaction_id: transactionId,
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment:", paymentError);
      throw paymentError;
    }

    console.log("Payment created:", paymentData);

    // 5. Generate invoice (only for paid exams)
    const appointmentDetails = {
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      exam_name: appointmentData.laboratory_exams.exams.name,
      laboratory_name: appointmentData.laboratory_exams.laboratories.name,
    };

    console.log("Appointment details:", appointmentDetails);

    const invoiceUrl = await generateInvoice(paymentData, appointmentDetails, userProfile);

    // 6. Update payment with invoice URL (if not free)
    if (invoiceUrl) {
      const { error: updateError } = await supabase
        .from("payments")
        .update({ invoice_url: invoiceUrl })
        .eq("id", paymentData.id);

      if (updateError) {
        console.error("Error updating payment with invoice:", updateError);
        throw updateError;
      }
    }

    // 7. Send confirmation email
    if (!userProfile.email) {
      console.warn("User email is missing, cannot send confirmation email");
    } else {
      console.log("Sending confirmation email to:", userProfile.email);
      await sendPaymentConfirmationEmail(
        userProfile.email,
        userProfile.full_name || "Valued Patient",
        { ...paymentData, invoice_url: invoiceUrl },
        appointmentDetails
      );
    }

    // 8. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: paymentMethod === "free" ? "Exam released successfully" : "Payment processed successfully",
        payment: { ...paymentData, invoice_url: invoiceUrl },
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred while processing payment",
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
