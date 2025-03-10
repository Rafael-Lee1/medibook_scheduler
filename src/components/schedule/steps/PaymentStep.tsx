
import { PaymentForm } from "@/components/payment/PaymentForm";

interface PaymentStepProps {
  appointmentId: string;
  examDetails: any;
  onPaymentSuccess: (paymentDetails: any) => void;
}

export const PaymentStep = ({
  appointmentId,
  examDetails,
  onPaymentSuccess,
}: PaymentStepProps) => {
  return (
    <PaymentForm 
      appointmentId={appointmentId}
      examPrice={examDetails.exams.price}
      onPaymentSuccess={onPaymentSuccess}
    />
  );
};
