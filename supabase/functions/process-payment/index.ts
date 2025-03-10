
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

async function sendAppointmentConfirmationEmail(userEmail: string, userName: string, appointmentDetails: any) {
  try {
    const emailSubject = "Your Exam Appointment Confirmation - MediBook";
    
    const emailContent = `
      <h1>Appointment Confirmation</h1>
      <p>Dear ${userName},</p>
      <p>Thank you for scheduling your medical exam with MediBook.</p>
      <h2>Appointment Details:</h2>
      <ul>
        <li>Exam: ${appointmentDetails.exam_name}</li>
        <li>Laboratory: ${appointmentDetails.laboratory_name}</li>
        <li>Date: ${appointmentDetails.appointment_date}</li>
        <li>Time: ${appointmentDetails.appointment_time}</li>
      </ul>
      <p>No payment is required for this appointment.</p>
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
    console.error("Error in sendAppointmentConfirmationEmail:", error);
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
    const { appointmentId, userId } = requestData;

    console.log(`Processing appointment ${appointmentId}`);

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

    // 3. Generate a transaction ID for reference
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 4. Create payment record (free)
    const { data: paymentData, error: paymentError } = await supabase
      .from("payments")
      .insert({
        user_id: userId,
        appointment_id: appointmentId,
        amount: 0,
        payment_method: "free",
        payment_status: "completed",
        transaction_id: transactionId,
        payment_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (paymentError) {
      console.error("Error creating payment record:", paymentError);
      throw paymentError;
    }

    console.log("Payment record created:", paymentData);

    // 5. Prepare appointment details for email
    const appointmentDetails = {
      appointment_date: appointmentData.appointment_date,
      appointment_time: appointmentData.appointment_time,
      exam_name: appointmentData.laboratory_exams.exams.name,
      laboratory_name: appointmentData.laboratory_exams.laboratories.name,
    };

    console.log("Appointment details:", appointmentDetails);

    // 6. Send confirmation email
    if (!userProfile.email) {
      console.warn("User email is missing, cannot send confirmation email");
    } else {
      console.log("Sending confirmation email to:", userProfile.email);
      await sendAppointmentConfirmationEmail(
        userProfile.email,
        userProfile.full_name || "Valued Patient",
        appointmentDetails
      );
    }

    // 7. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: "Appointment confirmed successfully",
        payment: paymentData,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error("Error processing appointment:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || "An error occurred while processing appointment",
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
