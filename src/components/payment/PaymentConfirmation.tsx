
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface PaymentConfirmationProps {
  paymentDetails: {
    id: string;
    amount: number;
    payment_method: string;
    payment_status?: string;
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
  const isPaymentSuccessful = paymentDetails.payment_status !== "failed";

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
          {isPaymentSuccessful ? (
            <CheckCircle className="h-16 w-16 text-green-500" />
          ) : (
            <AlertTriangle className="h-16 w-16 text-amber-500" />
          )}
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {isPaymentSuccessful ? "Payment Successful!" : "Payment Processing"}
        </h1>
        <p className="text-muted-foreground">
          {isPaymentSuccessful 
            ? "Your payment has been processed successfully."
            : "Your payment is being processed. Since this is a demo, you can continue."}
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
                <dt className="text-sm text-muted-foreground">Status</dt>
                <dd className={`font-medium ${isPaymentSuccessful ? 'text-green-600' : 'text-amber-600'}`}>
                  {isPaymentSuccessful ? 'Completed' : 'Processing'}
                </dd>
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

        {!isPaymentSuccessful && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md">
            <h4 className="font-medium text-amber-800 mb-1">Note about this demo</h4>
            <p className="text-amber-700 text-sm">
              In a real application, you would be redirected to try payment again. Since this is a demo, 
              we're allowing you to continue with the booking process even though the payment wasn't successful.
              A confirmation email has been sent with instructions.
            </p>
          </div>
        )}

        <div className="text-center space-y-3 pt-3">
          {isPaymentSuccessful && paymentDetails.invoice_url && (
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
