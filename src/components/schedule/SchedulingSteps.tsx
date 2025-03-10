
import { useState } from "react";
import { DateTimeSelection } from "./steps/DateTimeSelection";
import { ConfirmationStep } from "./steps/ConfirmationStep";

interface SchedulingStepsProps {
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
  selectedTime: string | undefined;
  setSelectedTime: (time: string) => void;
  existingAppointments: string[];
  examDetails: any;
  user: any;
  schedulingStep: "date-time" | "confirmation";
  setSchedulingStep: (step: "date-time" | "confirmation") => void;
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
  const handleAppointmentCreated = async (newAppointmentId: string) => {
    setAppointmentId(newAppointmentId);
    
    // Process the booking directly without payment step
    try {
      const { data: supabaseResponse } = await fetch("https://dxnzcvjyqghisjmmmiwl.supabase.co/functions/v1/process-payment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("supabase.auth.token")}`,
        },
        body: JSON.stringify({
          appointmentId: newAppointmentId,
          userId: user.id,
        }),
      }).then(res => res.json());
      
      setPaymentDetails(supabaseResponse.payment);
      setSchedulingStep("confirmation");
    } catch (error) {
      console.error("Error processing appointment:", error);
    }
  };

  if (schedulingStep === "date-time") {
    return (
      <DateTimeSelection
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        existingAppointments={existingAppointments}
        examDetails={examDetails}
        user={user}
        onProceed={handleAppointmentCreated}
      />
    );
  }

  if (schedulingStep === "confirmation" && paymentDetails) {
    return (
      <ConfirmationStep
        paymentDetails={paymentDetails}
        examDetails={examDetails}
        selectedDate={selectedDate}
        selectedTime={selectedTime}
      />
    );
  }

  return null;
};
