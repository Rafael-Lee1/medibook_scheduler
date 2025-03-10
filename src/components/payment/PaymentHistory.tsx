
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

export const PaymentHistory = () => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
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
              laboratories (id, name),
              exams (id, name)
            )
          `)
          .eq("user_id", user.id)
          .order("appointment_date", { ascending: false });
          
        if (error) throw error;
        setAppointments(data || []);
      } catch (err: any) {
        console.error("Error fetching appointments:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (isLoading) {
    return <div className="text-center py-8">Loading your appointments...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md my-4">
        <p className="text-red-700">Error loading your appointments: {error}</p>
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Appointment History</CardTitle>
          <CardDescription>
            You have no scheduled appointments yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Your appointment history will appear here once you've scheduled exams.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Appointment History</CardTitle>
        <CardDescription>
          Your scheduled and past appointments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div 
              key={appointment.id} 
              className="p-4 border rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">
                    {appointment.laboratory_exams.exams.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {appointment.laboratory_exams.laboratories.name}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm">
                    {format(new Date(appointment.appointment_date), "MMM dd, yyyy")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {appointment.appointment_time}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span 
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${appointment.status === 'scheduled' ? 'bg-green-100 text-green-800' : 
                      appointment.status === 'completed' ? 'bg-blue-100 text-blue-800' : 
                      appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'}`}
                >
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
