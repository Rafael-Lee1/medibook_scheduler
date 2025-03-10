import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import NavBar from "@/components/NavBar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExamDetails } from "@/components/schedule/ExamDetails";
import { SearchPrompt } from "@/components/schedule/SearchPrompt";
import { ExamNotFound } from "@/components/schedule/ExamNotFound";
import { SchedulingSteps } from "@/components/schedule/SchedulingSteps";

const Schedule = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [schedulingStep, setSchedulingStep] = useState<"date-time" | "confirmation">("date-time");
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

  if (!examId || !laboratoryId) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <NavBar />
        <main className="container mx-auto px-4 pt-32">
          <SearchPrompt />
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
          <ExamNotFound />
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

          <SchedulingSteps
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            selectedTime={selectedTime}
            setSelectedTime={setSelectedTime}
            existingAppointments={existingAppointments}
            examDetails={examDetails}
            user={user}
            schedulingStep={schedulingStep}
            setSchedulingStep={setSchedulingStep}
            appointmentId={appointmentId}
            setAppointmentId={setAppointmentId}
            paymentDetails={paymentDetails}
            setPaymentDetails={setPaymentDetails}
          />
        </div>
      </main>
    </div>
  );
};

export default Schedule;
