
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Receipt, FileText, AlertCircle } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const PaymentHistory = () => {
  const { user } = useAuth();

  const { data: payments = [], isLoading } = useQuery({
    queryKey: ["payment-history", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("payments")
        .select(`
          id,
          amount,
          payment_method,
          payment_status,
          transaction_id,
          payment_date,
          invoice_url,
          appointment_id,
          appointment: appointments (
            id,
            appointment_date,
            appointment_time,
            laboratory_exam_id,
            laboratory_exams (
              id,
              laboratories (id, name),
              exams (id, name, price)
            )
          )
        `)
        .eq("user_id", user.id)
        .order("payment_date", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

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

  const formatPaymentStatus = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "pending":
        return "Pending";
      case "failed":
        return "Failed";
      case "refunded":
        return "Refunded";
      default:
        return status;
    }
  };

  if (isLoading) {
    return <div>Loading payment history...</div>;
  }

  if (payments.length === 0) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center py-8">
          <Receipt className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No Payment History</h2>
          <p className="text-muted-foreground mb-4">
            You haven't made any payments yet.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Payment History</h2>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Exam</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {payments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>
                  {format(new Date(payment.payment_date), "MMM d, yyyy")}
                </TableCell>
                <TableCell>
                  {payment.appointment?.laboratory_exams.exams.name || "N/A"}
                </TableCell>
                <TableCell>${payment.amount.toFixed(2)}</TableCell>
                <TableCell>
                  {formatPaymentMethod(payment.payment_method)}
                </TableCell>
                <TableCell>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      payment.payment_status === "completed"
                        ? "bg-green-100 text-green-800"
                        : payment.payment_status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : payment.payment_status === "failed"
                        ? "bg-red-100 text-red-800"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {formatPaymentStatus(payment.payment_status)}
                  </span>
                </TableCell>
                <TableCell>
                  {payment.invoice_url ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(payment.invoice_url, "_blank")}
                      className="flex items-center"
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Invoice
                    </Button>
                  ) : (
                    <span className="text-muted-foreground flex items-center text-xs">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      No invoice
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};
