
import { z } from "zod";

export const paymentSchema = z.object({
  paymentMethod: z.enum(["credit_card", "debit_card", "paypal", "pix", "free"]),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCVC: z.string().optional(),
  cardName: z.string().optional(),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;

export type PaymentFormProps = {
  appointmentId: string;
  examPrice: number;
  onPaymentSuccess: (paymentDetails: any) => void;
};
