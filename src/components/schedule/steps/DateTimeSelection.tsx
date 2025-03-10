
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { DateSelector } from "../DateSelector";
import { TimeSlots } from "../TimeSlots";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

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

      onProceed(appointmentData.id);
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
          {isProcessing ? "Processing..." : "Proceed to Payment"}
        </Button>
      </div>
    </>
  );
};
