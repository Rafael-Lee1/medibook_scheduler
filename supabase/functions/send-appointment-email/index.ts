
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
  notificationType?: "confirmation" | "reschedule" | "cancellation";
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
      notificationType = "confirmation"
    }: AppointmentEmailRequest = await req.json();

    console.log("Attempting to send email to:", userEmail);
    console.log("Appointment details:", {
      userName,
      examName,
      laboratoryName,
      appointmentDate,
      appointmentTime,
      notificationType
    });

    let subject = "Your MediBook Appointment Confirmation";
    let html = "";

    switch(notificationType) {
      case "confirmation":
        subject = "Your MediBook Appointment Confirmation";
        html = `
          <h1>Appointment Confirmation</h1>
          <p>Dear ${userName},</p>
          <p>Thank you for scheduling your medical exam with MediBook. Your appointment has been successfully scheduled!</p>
          <h2>Appointment Details:</h2>
          <ul>
            <li>Exam: ${examName}</li>
            <li>Laboratory: ${laboratoryName}</li>
            <li>Date: ${appointmentDate}</li>
            <li>Time: ${appointmentTime}</li>
          </ul>
          <p>Please arrive 15 minutes before your scheduled time. If you need to reschedule or cancel your appointment, please visit your profile page.</p>
          <p>Best regards,<br>The MediBook Team</p>
        `;
        break;
      case "reschedule":
        subject = "Your MediBook Appointment Has Been Rescheduled";
        html = `
          <h1>Appointment Rescheduled</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully rescheduled!</p>
          <h2>New Appointment Details:</h2>
          <ul>
            <li>Exam: ${examName}</li>
            <li>Laboratory: ${laboratoryName}</li>
            <li>Date: ${appointmentDate}</li>
            <li>Time: ${appointmentTime}</li>
          </ul>
          <p>Please arrive 15 minutes before your scheduled time. If you need to make further changes to your appointment, please visit your profile page.</p>
          <p>Best regards,<br>The MediBook Team</p>
        `;
        break;
      case "cancellation":
        subject = "Your MediBook Appointment Has Been Cancelled";
        html = `
          <h1>Appointment Cancellation</h1>
          <p>Dear ${userName},</p>
          <p>Your appointment has been successfully cancelled.</p>
          <h2>Cancelled Appointment Details:</h2>
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
