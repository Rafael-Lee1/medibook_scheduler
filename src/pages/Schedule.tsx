
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NavBar from "@/components/NavBar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

const Schedule = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();

  const examId = searchParams.get("exam");
  const laboratoryId = searchParams.get("laboratory");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  // Fetch exam and laboratory details
  const { data: examDetails } = useQuery({
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

  // Fetch existing appointments for availability check
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
      const { error } = await supabase
        .from("appointments")
        .insert({
          laboratory_exam_id: examDetails.id,
          appointment_date: format(selectedDate, "yyyy-MM-dd"),
          appointment_time: selectedTime,
          user_id: user.id,
          status: "scheduled",
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your appointment has been scheduled.",
      });

      // Redirect to profile page
      navigate("/profile");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (!examDetails) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
        <NavBar />
        <main className="container mx-auto px-4 pt-32">
          <Card className="p-6">
            <p>Loading exam details...</p>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32">
        <div className="max-w-4xl mx-auto">
          <Card className="p-6 mb-6">
            <h1 className="text-2xl font-bold mb-4">Schedule Appointment</h1>
            <div className="mb-4">
              <h2 className="text-xl font-semibold">{examDetails.exams.name}</h2>
              <p className="text-muted-foreground">{examDetails.exams.description}</p>
              <div className="mt-4">
                <h3 className="font-semibold">Location</h3>
                <p>{examDetails.laboratories.name}</p>
                <p className="text-muted-foreground">{examDetails.laboratories.address}</p>
                <p className="text-muted-foreground">
                  {examDetails.laboratories.city}, {examDetails.laboratories.state}
                </p>
              </div>
              {examDetails.exams.preparation_instructions && (
                <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                  <h3 className="font-semibold mb-2">Preparation Instructions</h3>
                  <p>{examDetails.exams.preparation_instructions}</p>
                </div>
              )}
            </div>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Date</h2>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={{ before: new Date() }}
                className="rounded-md border"
              />
            </Card>

            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select Time</h2>
              {!selectedDate ? (
                <p className="text-muted-foreground">Please select a date first</p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((time) => {
                    const isBooked = existingAppointments.includes(time);
                    return (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        className="w-full"
                        disabled={isBooked}
                        onClick={() => setSelectedTime(time)}
                      >
                        {time}
                      </Button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>

          <div className="mt-6 flex justify-end">
            <Button
              size="lg"
              onClick={handleSchedule}
              disabled={!selectedDate || !selectedTime}
            >
              Confirm Appointment
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Schedule;
