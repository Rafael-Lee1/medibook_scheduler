
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExamDetails } from "@/components/schedule/ExamDetails";
import { DateSelector } from "@/components/schedule/DateSelector";
import { TimeSlots } from "@/components/schedule/TimeSlots";
import { PaymentForm } from "@/components/payment/PaymentForm";
import { PaymentConfirmation } from "@/components/payment/PaymentConfirmation";
import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";

const Schedule = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [schedulingStep, setSchedulingStep] = useState<"date-time" | "payment" | "confirmation">("date-time");
  const [appointmentId, setAppointmentId] = useState<string>();
  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const examId = searchParams.get("exam");
  const laboratoryId = searchParams.get("laboratory");

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  const { data: examDetails, isLoading } = useQuery({
    queryKey: ["examDetails", examId, laboratoryId],
    queryFn: async () => {
      if (!examId || !laboratoryId) return null;

      const { data, error } = await supabase
        .from("laboratory_exams")
        .select(`
          id,
          laboratories (
            id,
            name,
            address,
            city,
            state
          ),
          exams (
            id,
            name,
            type,
            description,
            price,
            preparation_instructions
          )
        `)
        .eq("exam_id", examId)
        .eq("laboratory_id", laboratoryId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!examId && !!laboratoryId,
  });

  const { data: existingAppointments = [] } = useQuery({
    queryKey: ["appointments", examId, laboratoryId, selectedDate],
    queryFn: async () => {
      if (!selectedDate) return [];

      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("laboratory_exam_id", examDetails?.id)
        .eq("appointment_date", format(selectedDate, "yyyy-MM-dd"));

      if (error) throw error;
      return data.map(apt => apt.appointment_time);
    },
    enabled: !!selectedDate && !!examDetails?.id,
  });

  const handleSchedule = async () => {
    if (!selectedDate || !selectedTime || !user || !examDetails) {
      toast({
        title: "Error",
        description: "Please select both date and time for your appointment",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the appointment
      const { data: appointmentData, error: appointmentError } = await supabase
        .from("appointments")
        .insert({
          laboratory_exam_id: examDetails.id,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
          user_id: user.id,
          status: "scheduled",
        })
        .select()
        .single();

      if (appointmentError) throw appointmentError;

      setAppointmentId(appointmentData.id);
      setSchedulingStep("payment");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePaymentSuccess = (paymentData: any) => {
    setPaymentDetails(paymentData);
    setSchedulingStep("confirmation");
  };

  if (!examId || !laboratoryId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <NavBar />
        <main className="container mx-auto px-4 pt-32">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Schedule an Appointment</h1>
            <p className="text-muted-foreground mb-6">
              To schedule an appointment, first search for and select an exam from our available options.
            </p>
            <Button 
              onClick={() => navigate("/search")}
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Search for Exams
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <NavBar />
        <main className="container mx-auto px-4 pt-32">
          <div>Loading exam details...</div>
        </main>
      </div>
    );
  }

  if (!examDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <NavBar />
        <main className="container mx-auto px-4 pt-32">
          <Card className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-4">Exam Not Found</h1>
            <p className="text-muted-foreground mb-6">
              We couldn't find the exam you're looking for. Please try searching again.
            </p>
            <Button 
              onClick={() => navigate("/search")}
              className="flex items-center gap-2"
            >
              <Search size={18} />
              Search for Exams
            </Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-4xl mx-auto">
          <ExamDetails
            exam={examDetails.exams}
            laboratory={examDetails.laboratories}
          />

          {schedulingStep === "date-time" && (
            <>
              <div className="grid gap-6 md:grid-cols-2">
                <DateSelector
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                />
                <TimeSlots
                  selectedDate={selectedDate}
                  selectedTime={selectedTime}
                  existingAppointments={existingAppointments}
                  onTimeSelect={setSelectedTime}
                />
              </div>

              <div className="mt-6 flex justify-end">
                <Button
                  size="lg"
                  onClick={handleSchedule}
                  disabled={!selectedDate || !selectedTime}
                >
                  Proceed to Payment
                </Button>
              </div>
            </>
          )}

          {schedulingStep === "payment" && examDetails && appointmentId && (
            <PaymentForm 
              appointmentId={appointmentId}
              examPrice={examDetails.exams.price}
              onPaymentSuccess={handlePaymentSuccess}
            />
          )}

          {schedulingStep === "confirmation" && paymentDetails && (
            <PaymentConfirmation 
              paymentDetails={paymentDetails}
              appointmentDetails={{
                examName: examDetails.exams.name,
                laboratoryName: examDetails.laboratories.name,
                appointmentDate: selectedDate ? format(selectedDate, "MMMM dd, yyyy") : "",
                appointmentTime: selectedTime || "",
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default Schedule;
