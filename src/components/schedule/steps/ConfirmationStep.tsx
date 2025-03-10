
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { format } from "date-fns";

interface ConfirmationStepProps {
  paymentDetails: any;
  examDetails: any;
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
}

export const ConfirmationStep = ({
  paymentDetails,
  examDetails,
  selectedDate,
  selectedTime,
}: ConfirmationStepProps) => {
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
};
