
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { paymentSchema, PaymentFormValues, PaymentFormProps } from "./PaymentSchema";
import { PaymentMethodSelector } from "./PaymentMethodSelector";
import { CardPaymentFields } from "./CardPaymentFields";
import { PaypalPayment } from "./PaypalPayment";
import { PixPayment } from "./PixPayment";
import { FreePayment } from "./FreePayment";

export const PaymentForm = ({ 
  appointmentId, 
  examPrice, 
  onPaymentSuccess 
}: PaymentFormProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "credit_card",
    },
  });

  const paymentMethod = form.watch("paymentMethod");

  const onSubmit = async (values: PaymentFormValues) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to make a payment",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsProcessing(true);

      // Call the Supabase Edge Function to process payment
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: {
          appointmentId,
          paymentMethod: values.paymentMethod,
          amount: values.paymentMethod === "free" ? 0 : examPrice,
          userId: user.id,
        },
      });

      if (error) throw error;

      toast({
        title: values.paymentMethod === "free" ? "Exam Released" : "Payment Successful",
        description: values.paymentMethod === "free" 
          ? "Your exam has been released for free" 
          : "Your payment has been processed successfully",
      });

      onPaymentSuccess(data.payment);
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: values.paymentMethod === "free" ? "Exam Release Failed" : "Payment Failed",
        description: error.message || "An error occurred while processing your request",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const renderPaymentMethodFields = () => {
    switch (paymentMethod) {
      case "credit_card":
      case "debit_card":
        return <CardPaymentFields form={form} />;
      case "paypal":
        return <PaypalPayment />;
      case "pix":
        return <PixPayment />;
      case "free":
        return <FreePayment />;
      default:
        return null;
    }
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payment Information</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="mb-4">
            <h3 className="text-lg font-medium mb-2">Total Amount:</h3>
            <p className="text-2xl font-bold">${examPrice.toFixed(2)}</p>
          </div>

          <PaymentMethodSelector form={form} />
          
          {renderPaymentMethodFields()}

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : paymentMethod === "free" ? "Release Exam for Free" : `Pay $${examPrice.toFixed(2)}`}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
