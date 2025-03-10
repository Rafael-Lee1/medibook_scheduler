
import { CreditCard, Banknote, Wallet, Gift } from "lucide-react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UseFormReturn } from "react-hook-form";
import { PaymentFormValues } from "./PaymentSchema";

type PaymentMethodSelectorProps = {
  form: UseFormReturn<PaymentFormValues>;
};

export const PaymentMethodSelector = ({ form }: PaymentMethodSelectorProps) => {
  return (
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
              <FormItem className="flex items-center space-x-3 space-y-0">
                <FormControl>
                  <RadioGroupItem value="free" />
                </FormControl>
                <FormLabel className="font-normal flex items-center gap-2">
                  <Gift size={18} />
                  Free
                </FormLabel>
              </FormItem>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
