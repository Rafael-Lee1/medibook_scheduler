
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import NavBar from "@/components/NavBar";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const MyExams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate("/auth", { replace: true });
    }
  }, [user, navigate]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["my-appointments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select(`
          id,
          appointment_date,
          appointment_time,
          status,
          laboratory_exam_id,
          laboratory_exams (
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
              price
            )
          )
        `)
        .eq("user_id", user?.id)
        .order("appointment_date", { ascending: true })
        .order("appointment_time", { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32">
        <Card className="p-6">
          <h1 className="text-2xl font-bold mb-6">My Scheduled Exams</h1>
          {isLoading ? (
            <p>Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">
                You don't have any scheduled exams yet.
              </p>
              <Button onClick={() => navigate("/search")}>
                Find and Schedule Exams
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Exam</TableHead>
                  <TableHead>Laboratory</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {appointments.map((appointment) => (
                  <TableRow key={appointment.id}>
                    <TableCell>
                      {appointment.laboratory_exams.exams.name}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{appointment.laboratory_exams.laboratories.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {appointment.laboratory_exams.laboratories.city},{" "}
                          {appointment.laboratory_exams.laboratories.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      {format(new Date(`2000-01-01T${appointment.appointment_time}`), "h:mm a")}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{appointment.status}</span>
                    </TableCell>
                    <TableCell>
                      ${appointment.laboratory_exams.exams.price.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </main>
    </div>
  );
};

export default MyExams;
