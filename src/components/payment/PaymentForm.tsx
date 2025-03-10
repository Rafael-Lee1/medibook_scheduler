import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, Banknote, Wallet, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

const paymentSchema = z.object({
  paymentMethod: z.enum(["credit_card", "debit_card", "paypal", "pix"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
  cardName: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  appointmentId: string;
  examPrice: number;
  onPaymentSuccess: (paymentDetails: any) => void;
}

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
          amount: examPrice,
          userId: user.id,
        },
      });

      if (error) throw error;

      // Check if payment was successful
      if (data.success) {
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully",
        });
        
        onPaymentSuccess(data.payment);
      } else {
        // Handle failed payment but still allow the user to continue
        // This is for demo purposes
        toast({
          title: "Payment Failed",
          description: "Your payment couldn't be processed. However, since this is a demo, you can continue reviewing the booking details.",
          variant: "destructive",
        });
        
        // Even though payment failed, we still call onPaymentSuccess to move to the confirmation page
        // This is for demo purposes only - in a real app, you would redirect to an error page or retry payment
        onPaymentSuccess(data.payment);
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Failed",
        description: error.message || "An error occurred while processing your payment. Since this is a demo, you can still proceed.",
        variant: "destructive",
      });
      
      // For the demo, we'll still call onPaymentSuccess with basic payment details
      // This allows the user to continue through the flow even if there's an error
      onPaymentSuccess({
        id: "demo-error-id",
        amount: examPrice,
        payment_method: values.paymentMethod,
        payment_status: "failed",
        transaction_id: "demo-error-transaction",
      });
    } finally {
      setIsProcessing(false);
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

          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel>Payment Method</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="grid grid-cols-2 gap-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="credit_card" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <CreditCard size={18} />
                        Credit Card
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="debit_card" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <CreditCard size={18} />
                        Debit Card
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="paypal" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <Wallet size={18} />
                        PayPal
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="pix" />
                      </FormControl>
                      <FormLabel className="font-normal flex items-center gap-2">
                        <Banknote size={18} />
                        Pix
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {(paymentMethod === "credit_card" || paymentMethod === "debit_card") && (
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="cardName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name on Card</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="John Doe"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="cardExpiry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiration Date</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="MM/YY"
                          maxLength={5}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cardCVC"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVC</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123"
                          maxLength={4}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          )}

          {paymentMethod === "paypal" && (
            <div className="py-4 text-center">
              <p className="mb-4">You will be redirected to PayPal to complete your payment</p>
            </div>
          )}

          {paymentMethod === "pix" && (
            <div className="py-4 text-center">
              <p className="mb-4">Please scan the QR code or copy the PIX key to complete your payment</p>
              <div className="bg-gray-200 p-10 rounded-lg mb-4 mx-auto w-48 h-48 flex items-center justify-center">
                <span className="text-gray-500">PIX QR Code</span>
              </div>
              <div className="flex items-center gap-2 justify-center">
                <code className="bg-gray-100 px-4 py-2 rounded">AB12.CD34.EF56.GH78</code>
                <Button variant="outline" size="icon">
                  <Check size={16} />
                </Button>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            className="w-full mt-6" 
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `Pay $${examPrice.toFixed(2)}`}
          </Button>
        </form>
      </Form>
    </Card>
  );
};
