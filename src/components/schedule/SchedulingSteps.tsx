
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { format } from "date-fns";
import { DateSelector } from "./DateSelector";
import { TimeSlots } from "./TimeSlots";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SchedulingStepsProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  existingAppointments: string[];
  examDetails: any;
  user: any;
  schedulingStep: "date-time" | "payment" | "confirmation";
  setSchedulingStep: (step: "date-time" | "payment" | "confirmation") => void;
  appointmentId: string | undefined;
  setAppointmentId: (id: string) => void;
  paymentDetails: any;
  setPaymentDetails: (details: any) => void;
}

export const SchedulingSteps = ({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  existingAppointments,
  examDetails,
  user,
  schedulingStep,
  setSchedulingStep,
  appointmentId,
  setAppointmentId,
  paymentDetails,
  setPaymentDetails,
}: SchedulingStepsProps) => {
  const { toast } = useToast();

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

      setAppointmentId(appointmentData.id);
      setSchedulingStep("payment");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentDetails(paymentData);
    setSchedulingStep("confirmation");
  };

  if (schedulingStep === "date-time") {
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
            disabled={!selectedDate || !selectedTime}
          >
            Proceed to Payment
          </Button>
        </div>
      </>
    );
  }

  if (schedulingStep === "payment" && examDetails && appointmentId) {
    return (
      <PaymentForm 
        appointmentId={appointmentId}
        examPrice={examDetails.exams.price}
        onPaymentSuccess={handlePaymentSuccess}
      />
    );
  }

  if (schedulingStep === "confirmation" && paymentDetails) {
    return (
      <PaymentConfirmation 
        paymentDetails={paymentDetails}
        appointmentDetails={{
          examName: examDetails.exams.name,
          laboratoryName: examDetails.laboratories.name,
          appointmentDate: selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "",
          appointmentTime: selectedTime || "",
        }}
      />
    );
  }

  return null;
};
