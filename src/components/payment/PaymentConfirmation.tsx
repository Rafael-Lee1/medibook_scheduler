
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface PaymentConfirmationProps {
  paymentDetails: any;
  appointmentDetails: {
    examName: string;
    laboratoryName: string;
    appointmentDate: string;
    appointmentTime: string;
  };
}

export const PaymentConfirmation = ({
  appointmentDetails,
}: PaymentConfirmationProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
        <p className="text-muted-foreground">
          Your appointment has been successfully scheduled.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
          <CardDescription>
            Your exam has been scheduled successfully
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-sm font-medium">Exam:</div>
            <div className="text-sm">{appointmentDetails.examName}</div>
            
            <div className="text-sm font-medium">Laboratory:</div>
            <div className="text-sm">{appointmentDetails.laboratoryName}</div>
            
            <div className="text-sm font-medium">Date:</div>
            <div className="text-sm">{appointmentDetails.appointmentDate}</div>
            
            <div className="text-sm font-medium">Time:</div>
            <div className="text-sm">{appointmentDetails.appointmentTime}</div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1 md:flex md:justify-between">
                <p className="text-sm text-blue-700">
                  A confirmation email has been sent to your registered email address.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
