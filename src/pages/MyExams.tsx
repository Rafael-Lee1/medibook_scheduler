
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { CancelExamDialog } from "@/components/exam/CancelExamDialog";
import { RescheduleExamDialog } from "@/components/exam/RescheduleExamDialog";
import { Calendar, Clock, AlertCircle, RotateCcw, XCircle } from "lucide-react";

const MyExams = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for dialogs
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  // Query to fetch user's appointments
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

  // Query to fetch user profile for email notifications
  const { data: userProfile } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mutation for canceling appointments
  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAppointment) return;

      const { error } = await supabase
        .from("appointments")
        .update({ status: "canceled" })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      // Send email notification
      if (userProfile?.email) {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            userEmail: userProfile.email,
            userName: userProfile.full_name || "Valued Patient",
            examName: selectedAppointment.laboratory_exams.exams.name,
            laboratoryName: selectedAppointment.laboratory_exams.laboratories.name,
            appointmentDate: format(new Date(selectedAppointment.appointment_date), "MMMM dd, yyyy"),
            appointmentTime: format(
              new Date(`2000-01-01T${selectedAppointment.appointment_time}`),
              "h:mm a"
            ),
            action: "canceled",
          },
        });
      }
    },
    onSuccess: () => {
      toast({
        title: "Appointment Canceled",
        description: "Your appointment has been successfully canceled.",
      });
      setCancelDialogOpen(false);
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to cancel appointment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation for rescheduling appointments
  const rescheduleMutation = useMutation({
    mutationFn: async ({ date, time }: { date: Date; time: string }) => {
      if (!selectedAppointment) return;

      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Store previous details for notification
      const previousDate = selectedAppointment.appointment_date;
      const previousTime = selectedAppointment.appointment_time;

      const { error } = await supabase
        .from("appointments")
        .update({
          appointment_date: formattedDate,
          appointment_time: time,
          status: "rescheduled"
        })
        .eq("id", selectedAppointment.id);

      if (error) throw error;

      // Send email notification
      if (userProfile?.email) {
        await supabase.functions.invoke("send-appointment-email", {
          body: {
            userEmail: userProfile.email,
            userName: userProfile.full_name || "Valued Patient",
            examName: selectedAppointment.laboratory_exams.exams.name,
            laboratoryName: selectedAppointment.laboratory_exams.laboratories.name,
            appointmentDate: format(date, "MMMM dd, yyyy"),
            appointmentTime: format(new Date(`2000-01-01T${time}`), "h:mm a"),
            action: "rescheduled",
            previousDate: format(new Date(previousDate), "MMMM dd, yyyy"),
            previousTime: format(new Date(`2000-01-01T${previousTime}`), "h:mm a"),
          },
        });
      }

      return { formattedDate, time };
    },
    onSuccess: (data) => {
      if (data) {
        toast({
          title: "Appointment Rescheduled",
          description: `Your appointment has been rescheduled to ${format(
            new Date(data.formattedDate),
            "MMM d, yyyy"
          )} at ${format(new Date(`2000-01-01T${data.time}`), "h:mm a")}`,
        });
      }
      setRescheduleDialogOpen(false);
      setSelectedAppointment(null);
      queryClient.invalidateQueries({ queryKey: ["my-appointments"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: `Failed to reschedule appointment: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleCancelClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setCancelDialogOpen(true);
  };

  const handleRescheduleClick = (appointment: any) => {
    setSelectedAppointment(appointment);
    setRescheduleDialogOpen(true);
  };

  const handleReschedule = async (date: Date, time: string) => {
    await rescheduleMutation.mutateAsync({ date, time });
  };

  const handleCancel = async () => {
    await cancelMutation.mutateAsync();
  };

  // Determine if an appointment can be managed (not past and not canceled)
  const canManageAppointment = (appointment: any) => {
    const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
    const now = new Date();
    return appointmentDate > now && appointment.status !== "canceled";
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-green-100 text-green-800 px-2 py-1 rounded-md text-xs font-medium";
      case "completed":
        return "bg-blue-100 text-blue-800 px-2 py-1 rounded-md text-xs font-medium";
      case "canceled":
        return "bg-red-100 text-red-800 px-2 py-1 rounded-md text-xs font-medium";
      case "rescheduled":
        return "bg-amber-100 text-amber-800 px-2 py-1 rounded-md text-xs font-medium";
      default:
        return "bg-gray-100 text-gray-800 px-2 py-1 rounded-md text-xs font-medium";
    }
  };

  if (!user) {
    navigate("/auth", { replace: true });
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <NavBar />
      <main className="container mx-auto px-4 pt-32 pb-16">
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
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Laboratory</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Actions</TableHead>
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
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                          {format(new Date(appointment.appointment_date), "MMM d, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                          {format(new Date(`2000-01-01T${appointment.appointment_time}`), "h:mm a")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={getStatusBadge(appointment.status)}>
                          {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                        </span>
                      </TableCell>
                      <TableCell>
                        ${appointment.laboratory_exams.exams.price.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {canManageAppointment(appointment) ? (
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRescheduleClick(appointment)}
                              className="flex items-center"
                            >
                              <RotateCcw className="mr-1 h-3 w-3" />
                              Reschedule
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 border-red-200 hover:bg-red-50 flex items-center"
                              onClick={() => handleCancelClick(appointment)}
                            >
                              <XCircle className="mr-1 h-3 w-3" />
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center text-muted-foreground text-sm">
                            <AlertCircle className="mr-1 h-3 w-3" />
                            {appointment.status === "canceled" 
                              ? "Canceled" 
                              : "Not modifiable"}
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      </main>

      {/* Cancel Dialog */}
      {selectedAppointment && (
        <CancelExamDialog
          isOpen={cancelDialogOpen}
          examName={selectedAppointment.laboratory_exams?.exams.name || ""}
          onCancel={() => setCancelDialogOpen(false)}
          onConfirm={handleCancel}
          isLoading={cancelMutation.isPending}
        />
      )}

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <RescheduleExamDialog
          isOpen={rescheduleDialogOpen}
          onClose={() => setRescheduleDialogOpen(false)}
          appointmentId={selectedAppointment.id}
          examName={selectedAppointment.laboratory_exams?.exams.name || ""}
          laboratoryExamId={selectedAppointment.laboratory_exam_id}
          currentDate={selectedAppointment.appointment_date}
          currentTime={selectedAppointment.appointment_time}
          onReschedule={handleReschedule}
          isLoading={rescheduleMutation.isPending}
        />
      )}
    </div>
  );
};

export default MyExams;
