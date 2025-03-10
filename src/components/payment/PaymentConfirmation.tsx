
import { CheckCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaymentConfirmationProps {
  paymentDetails: {
    id: string;
    amount: number;
    payment_method: string;
    transaction_id: string;
    invoice_url?: string;
  };
  appointmentDetails: {
    examName: string;
    laboratoryName: string;
    appointmentDate: string;
    appointmentTime: string;
  };
}

export const PaymentConfirmation = ({
  paymentDetails,
  appointmentDetails,
}: PaymentConfirmationProps) => {
  const navigate = useNavigate();

  const formatPaymentMethod = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "paypal":
        return "PayPal";
      case "pix":
        return "Pix";
      default:
        return method;
    }
  };

  return (
    <Card className="p-6 max-w-xl mx-auto">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-muted-foreground">
          Your payment has been processed successfully.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Exam Details</h3>
          <div className="bg-secondary/20 p-4 rounded-md">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-sm text-muted-foreground">Exam</dt>
                <dd className="font-medium">{appointmentDetails.examName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Laboratory</dt>
                <dd className="font-medium">{appointmentDetails.laboratoryName}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd className="font-medium">{appointmentDetails.appointmentDate}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Time</dt>
                <dd className="font-medium">{appointmentDetails.appointmentTime}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Payment Details</h3>
          <div className="bg-secondary/20 p-4 rounded-md">
            <dl className="grid grid-cols-2 gap-3">
              <div>
                <dt className="text-sm text-muted-foreground">Amount</dt>
                <dd className="font-medium">${paymentDetails.amount.toFixed(2)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Payment Method</dt>
                <dd className="font-medium">{formatPaymentMethod(paymentDetails.payment_method)}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Transaction ID</dt>
                <dd className="font-medium truncate">{paymentDetails.transaction_id}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted-foreground">Date</dt>
                <dd className="font-medium">{new Date().toLocaleDateString()}</dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="text-center space-y-3 pt-3">
          {paymentDetails.invoice_url && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => window.open(paymentDetails.invoice_url, "_blank")}
            >
              View Invoice
            </Button>
          )}
          <Button
            className="w-full"
            onClick={() => navigate("/my-exams")}
          >
            View My Exams
          </Button>
        </div>
      </div>
    </Card>
  );
};
