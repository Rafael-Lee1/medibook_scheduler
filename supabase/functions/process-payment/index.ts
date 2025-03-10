
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
  const invoiceUrl = `${supabaseUrl}/storage/v1/object/public/invoices/${payment.id}.html`;
  
  console.log(`Generated invoice URL: ${invoiceUrl}`);
  return invoiceUrl;
}

async function sendPaymentEmail(
  userEmail: string, 
  userName: string, 
  paymentDetails: any, 
  appointmentDetails: any, 
  success: boolean
) {
  try {
    const subject = success 
      ? `Payment Confirmation - ${appointmentDetails.exam_name}`
      : `Payment Attempt - ${appointmentDetails.exam_name}`;

    let emailContent = '';
    if (success) {
      emailContent = `
        <h1>Payment Confirmed</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for your payment of $${paymentDetails.amount} for your medical exam.</p>
        <h2>Appointment Details:</h2>
        <ul>
          <li>Exam: ${appointmentDetails.exam_name}</li>
          <li>Laboratory: ${appointmentDetails.laboratory_name}</li>
          <li>Date: ${appointmentDetails.appointment_date}</li>
          <li>Time: ${appointmentDetails.appointment_time}</li>
        </ul>
        <h2>Payment Details:</h2>
        <ul>
          <li>Amount: $${paymentDetails.amount}</li>
          <li>Payment Method: ${paymentDetails.payment_method}</li>
          <li>Transaction ID: ${paymentDetails.transaction_id || 'N/A'}</li>
          <li>Payment Date: ${new Date(paymentDetails.payment_date).toLocaleString()}</li>
        </ul>
        <p>You can view your invoice by clicking <a href="${paymentDetails.invoice_url}">here</a>.</p>
        <p>Thank you for choosing MediBook for your medical exams.</p>
      `;
    } else {
      emailContent = `
        <h1>Payment Attempted</h1>
        <p>Dear ${userName},</p>
        <p>Thank you for your attempt to book a medical exam with MediBook.</p>
        <p>We noticed that your payment of $${paymentDetails.amount} was not completed successfully.</p>
        <h2>Exam Details:</h2>
        <ul>
          <li>Exam: ${appointmentDetails.exam_name}</li>
          <li>Laboratory: ${appointmentDetails.laboratory_name}</li>
          <li>Date: ${appointmentDetails.appointment_date}</li>
          <li>Time: ${appointmentDetails.appointment_time}</li>
        </ul>
        <h2>What to do next:</h2>
        <p>Since this is a demo website, you can:</p>
        <ul>
          <li>Try the payment again with a different payment method</li>
          <li>Return to the scheduling page to select a different appointment time</li>
          <li>Contact our support team at support@medibook.demo for assistance</li>
        </ul>
        <p>Your booking is not complete until the payment is successfully processed.</p>
        <p>Thank you for your understanding and for trying MediBook for your medical exams.</p>
      `;
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "MediBook <no-reply@resend.dev>",
        to: userEmail,
        subject: subject,
        html: emailContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error sending email:", errorData);
      throw new Error(`Failed to send email: ${JSON.stringify(errorData)}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error in sendPaymentEmail:", error);
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

    const appointmentDetails = {
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      exam_name: appointmentData.laboratory_exams.exams.name,
      laboratory_name: appointmentData.laboratory_exams.laboratories.name,
    };

    // Simulate a payment success or failure (for demo purposes)
    // In a real app, this would be determined by a payment processor
    let paymentSuccess = true;
    
    // For demo purposes, we'll randomly fail some payments (approx 20% failure rate)
    // Comment this out if you want all payments to succeed
    paymentSuccess = Math.random() > 0.2;

    // 3. Generate a transaction ID (in real app, this would come from payment processor)
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    let paymentData;
    let invoiceUrl = '';
    
    if (paymentSuccess) {
      // 4. Create payment record for successful payment
      const { data: createdPayment, error: paymentError } = await supabase
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

      paymentData = createdPayment;

      // 5. Generate invoice for successful payment
      invoiceUrl = await generateInvoice(paymentData, appointmentDetails, userProfile);

      // 6. Update payment with invoice URL
      const { error: updateError } = await supabase
        .from("payments")
        .update({ invoice_url: invoiceUrl })
        .eq("id", paymentData.id);

      if (updateError) {
        console.error("Error updating payment with invoice:", updateError);
        throw updateError;
      }
      
      // Update with invoice URL
      paymentData.invoice_url = invoiceUrl;
    } else {
      // For failed payments, we'll create a record with status "failed"
      const { data: failedPayment, error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: userId,
          appointment_id: appointmentId,
          amount: amount,
          payment_method: paymentMethod,
          payment_status: "failed",
          transaction_id: transactionId,
          payment_date: new Date().toISOString(),
        })
        .select()
        .single();

      if (paymentError) {
        console.error("Error creating failed payment record:", paymentError);
        throw paymentError;
      }

      paymentData = failedPayment;
    }

    // 7. Send confirmation email (for both successful and failed payments)
    await sendPaymentEmail(
      userProfile.email || "",
      userProfile.full_name || "Valued Patient",
      paymentData,
      appointmentDetails,
      paymentSuccess
    );

    // 8. Return response
    return new Response(
      JSON.stringify({
        success: paymentSuccess,
        message: paymentSuccess 
          ? "Payment processed successfully" 
          : "Payment processing failed",
        payment: paymentData,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
        status: paymentSuccess ? 200 : 400,
      }
    );
  } catch (error) {
    console.error("Error processing payment:", error);
    
    // Try to extract user and appointment details to send a failure email
    // This is a best-effort attempt, so we catch any errors to avoid breaking the main error flow
    try {
      const requestData = await req.json();
      const { appointmentId, amount, userId } = requestData;
      
      // Get user profile
      const { data: userProfile } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .eq("id", userId)
        .single();
        
      // Get appointment details
      const { data: appointmentData } = await supabase
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
        
      if (userProfile && appointmentData) {
        const appointmentDetails = {
          appointment_date: appointmentData.appointment_date,
          appointment_time: appointmentData.appointment_time,
          exam_name: appointmentData.laboratory_exams.exams.name,
          laboratory_name: appointmentData.laboratory_exams.laboratories.name,
        };
        
        const paymentDetails = {
          amount: amount,
          payment_method: "unknown",
          transaction_id: "failed",
          payment_date: new Date().toISOString(),
        };
        
        // Send failure email
        await sendPaymentEmail(
          userProfile.email,
          userProfile.full_name || "Valued Patient",
          paymentDetails,
          appointmentDetails,
          false
        );
      }
    } catch (emailError) {
      console.error("Failed to send error notification email:", emailError);
      // We don't throw here because we still want to return the main error response
    }
    
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
