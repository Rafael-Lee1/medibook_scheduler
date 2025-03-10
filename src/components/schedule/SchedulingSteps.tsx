
import { DateTimeSelection } from "./steps/DateTimeSelection";

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
  const handleAppointmentCreated = (newAppointmentId: string) => {
    setAppointmentId(newAppointmentId);
    // We no longer need to process payment or change steps
    // as we'll redirect directly to my-exams page
  };

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
};
