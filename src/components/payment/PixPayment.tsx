
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export const PixPayment = () => {
  return (
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
  );
};
