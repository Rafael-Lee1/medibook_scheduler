
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CancelExamDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: any;
  onSuccess: () => void;
}

export function CancelExamDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: CancelExamDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleCancel = async () => {
    if (!user || !appointment) return;
    
    setIsLoading(true);
    try {
      // Update appointment status to canceled
      const { error: updateError } = await supabase
        .from("appointments")
        .update({ status: "canceled" })
        .eq("id", appointment.id)
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      // Send cancellation email notification
      const { error: emailError } = await supabase.functions.invoke("send-appointment-email", {
        body: {
          userEmail: user.email,
          userName: user.email?.split('@')[0] || "User",
          examName: appointment.laboratory_exams.exams.name,
          laboratoryName: appointment.laboratory_exams.laboratories.name,
          appointmentDate: format(new Date(appointment.appointment_date), "MMMM dd, yyyy"),
          appointmentTime: format(new Date(`2000-01-01T${appointment.appointment_time}`), "h:mm a"),
          notificationType: "cancellation",
        },
      });

      if (emailError) {
        console.error("Error sending email:", emailError);
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to cancel appointment",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Appointment</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel your appointment for{" "}
            <strong>{appointment?.laboratory_exams.exams.name}</strong> at{" "}
            <strong>{appointment?.laboratory_exams.laboratories.name}</strong> on{" "}
            <strong>
              {format(new Date(appointment?.appointment_date), "MMMM dd, yyyy")} at{" "}
              {format(new Date(`2000-01-01T${appointment?.appointment_time}`), "h:mm a")}
            </strong>
            ?
            <br />
            <br />
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Cancelling...
              </>
            ) : (
              "Yes, cancel appointment"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
