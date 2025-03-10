
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DateSelector } from "@/components/schedule/DateSelector";
import { TimeSlots } from "@/components/schedule/TimeSlots";

interface RescheduleExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess: () => void;
}

export function RescheduleExamDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: RescheduleExamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [existingAppointments, setExistingAppointments] = useState<string[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // Reset selections when dialog opens or appointment changes
    if (open) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  }, [open, appointment]);

  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      if (!selectedDate || !appointment) return;

      try {
        const { data, error } = await supabase
          .from("appointments")
          .select("appointment_time")
          .eq("laboratory_exam_id", appointment.laboratory_exam_id)
          .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"))
          .neq("id", appointment.id) // Exclude the current appointment
          .eq("status", "scheduled"); // Only consider scheduled appointments

        if (error) throw error;
        setExistingAppointments(data.map((apt) => apt.appointment_time));
      } catch (error) {
        console.error("Error fetching available time slots:", error);
      }
    };

    fetchAvailableTimeSlots();
  }, [selectedDate, appointment]);

  const handleReschedule = async () => {
    if (!user || !appointment || !selectedDate || !selectedTime) return;
    
    setIsLoading(true);
    try {
      // Update appointment with new date and time
      const { error: updateError } = await supabase
        .from("appointments")
        .update({
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
        })
        .eq("id", appointment.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Send rescheduling email notification
      const { error: emailError } = await supabase.functions.invoke("send-appointment-email", {
        body: {
          userEmail: user.email,
          userName: user.email?.split('@')[0] || "User",
          examName: appointment.laboratory_exams.exams.name,
          laboratoryName: appointment.laboratory_exams.laboratories.name,
          appointmentDate: format(selectedDate, "MMMM dd, yyyy"),
          appointmentTime: format(new Date(`2000-01-01T${selectedTime}`), "h:mm a"),
          notificationType: "reschedule",
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reschedule appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Reschedule Appointment</DialogTitle>
          <DialogDescription>
            Reschedule your appointment for{" "}
            <strong>{appointment?.laboratory_exams.exams.name}</strong> at{" "}
            <strong>{appointment?.laboratory_exams.laboratories.name}</strong>
            <br />
            Currently scheduled for{" "}
            <strong>
              {format(new Date(appointment?.appointment_date), "MMMM dd, yyyy")} at{" "}
              {format(new Date(`2000-01-01T${appointment?.appointment_time}`), "h:mm a")}
            </strong>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <h3 className="text-lg font-medium">Select a new date and time</h3>
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
        </div>

        <DialogFooter>
          <Button
            variant="default"
            onClick={handleReschedule}
            disabled={isLoading || !selectedDate || !selectedTime}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Rescheduling...
              </>
            ) : (
              "Confirm Reschedule"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
