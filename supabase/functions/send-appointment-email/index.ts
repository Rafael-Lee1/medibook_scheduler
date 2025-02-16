
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
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      userEmail,
      userName,
      examName,
      laboratoryName,
      appointmentDate,
      appointmentTime,
    }: AppointmentEmailRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "MediBook <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Your MediBook Appointment Confirmation",
      html: `
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
      `,
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
