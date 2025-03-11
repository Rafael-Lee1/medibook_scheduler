
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { DateSelector } from "../DateSelector";
import { TimeSlots } from "../TimeSlots";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface DateTimeSelectionProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  existingAppointments: string[];
  examDetails: any;
  user: any;
  onProceed: (appointmentId: string) => void;
}

export const DateTimeSelection = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  existingAppointments,
  examDetails,
  user,
  onProceed,
}: DateTimeSelectionProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !user || !examDetails) {
      toast({
        title: "Error",
        description: "Please select both date and time for your appointment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          laboratory_exam_id: examDetails.id,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
          user_id: user.id,
          status: "scheduled",
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      // Send confirmation email using authenticated function call
      try {
        const { error: emailError } = await supabase.functions.invoke("send-appointment-email", {
          body: {
            userEmail: user.email,
            userName: user.user_metadata?.full_name || "Patient",
            examName: examDetails.exams.name,
            laboratoryName: examDetails.laboratories.name,
            appointmentDate: format(selectedDate, "PPP"),
            appointmentTime: selectedTime,
            notificationType: "confirmation",
          },
        });

        if (emailError) {
          console.error("Failed to send confirmation email:", emailError);
        }
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
        // Continue with the flow even if email fails
      }

      toast({
        title: "Appointment Confirmed",
        description: "Your appointment has been successfully scheduled.",
      });

      // Redirect to My Exams page after a short delay
      setTimeout(() => {
        navigate("/my-exams");
      }, 1500);
      
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2">
        <DateSelector
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
        />
        <TimeSlots
          selectedDate={selectedDate}
          selectedTime={selectedTime}
          existingAppointments={existingAppointments}
          onTimeSelect={setSelectedTime}
        />
      </div>

      <div className="mt-6 flex justify-end">
        <Button
          size="lg"
          onClick={handleSchedule}
          disabled={!selectedDate || !selectedTime || isProcessing}
        >
          {isProcessing ? "Processing..." : "Confirmar Agendamento"}
        </Button>
      </div>
    </>
  );
};
