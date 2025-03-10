
import { useState } from "react";
import { DateTimeSelection } from "./steps/DateTimeSelection";
import { PaymentStep } from "./steps/PaymentStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";

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
  const handleAppointmentCreated = (newAppointmentId: string) => {
    setAppointmentId(newAppointmentId);
    setSchedulingStep("payment");
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentDetails(paymentData);
    setSchedulingStep("confirmation");
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

  if (schedulingStep === "payment" && examDetails && appointmentId) {
    return (
      <PaymentStep
        appointmentId={appointmentId}
        examDetails={examDetails}
        onPaymentSuccess={handlePaymentSuccess}
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
