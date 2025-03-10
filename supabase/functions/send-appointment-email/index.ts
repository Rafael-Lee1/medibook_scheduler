
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface AppointmentEmailRequest {
  userEmail: string;
  userName: string;
  examName: string;
  laboratoryName: string;
  appointmentDate: string;
  appointmentTime: string;
  action?: "booked" | "rescheduled" | "canceled";
  previousDate?: string;
  previousTime?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received request to send email");
    
    const {
      userEmail,
      userName,
      examName,
      laboratoryName,
      appointmentDate,
      appointmentTime,
      action = "booked",
      previousDate,
      previousTime,
    }: AppointmentEmailRequest = await req.json();

    console.log("Attempting to send email to:", userEmail);
    console.log("Appointment details:", {
      userName,
      examName,
      laboratoryName,
      appointmentDate,
      appointmentTime,
      action,
      previousDate,
      previousTime,
    });

    let subject = "Your MediBook Appointment Confirmation";
    let html = "";

    switch (action) {
      case "booked":
        subject = "Your MediBook Appointment Confirmation";
        html = `
          <h1>Appointment Confirmation</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully scheduled!</p>
          <h2>Appointment Details:</h2>
          <ul>
            <li>Exam: ${examName}</li>
            <li>Laboratory: ${laboratoryName}</li>
            <li>Date: ${appointmentDate}</li>
            <li>Time: ${appointmentTime}</li>
          </ul>
          <p>If you need to reschedule or cancel your appointment, please visit your profile page.</p>
          <p>Best regards,<br>The MediBook Team</p>
        `;
        break;
      case "rescheduled":
        subject = "Your MediBook Appointment Has Been Rescheduled";
        html = `
          <h1>Appointment Rescheduled</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully rescheduled!</p>
          <h2>Previous Appointment:</h2>
          <ul>
            <li>Date: ${previousDate}</li>
            <li>Time: ${previousTime}</li>
          </ul>
          <h2>New Appointment Details:</h2>
          <ul>
            <li>Exam: ${examName}</li>
            <li>Laboratory: ${laboratoryName}</li>
            <li>Date: ${appointmentDate}</li>
            <li>Time: ${appointmentTime}</li>
          </ul>
          <p>If you need to make further changes to your appointment, please visit your profile page.</p>
          <p>Best regards,<br>The MediBook Team</p>
        `;
        break;
      case "canceled":
        subject = "Your MediBook Appointment Has Been Canceled";
        html = `
          <h1>Appointment Cancellation</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully canceled.</p>
          <h2>Canceled Appointment Details:</h2>
          <ul>
            <li>Exam: ${examName}</li>
            <li>Laboratory: ${laboratoryName}</li>
            <li>Date: ${appointmentDate}</li>
            <li>Time: ${appointmentTime}</li>
          </ul>
          <p>If you wish to schedule a new appointment, please visit our website.</p>
          <p>Best regards,<br>The MediBook Team</p>
        `;
        break;
    }

    const emailResponse = await resend.emails.send({
      from: "MediBook <appointments@medibook.website>",
      to: [userEmail],
      subject: subject,
      html: html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending appointment confirmation email:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
    });
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
