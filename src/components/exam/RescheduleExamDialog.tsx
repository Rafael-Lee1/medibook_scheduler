
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DateSelector } from "@/components/schedule/DateSelector";
import { TimeSlots } from "@/components/schedule/TimeSlots";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface RescheduleExamDialogProps {
  isOpen: boolean;
  onClose: () => void;
  appointmentId: string;
  examName: string;
  laboratoryExamId: string;
  currentDate: string;
  currentTime: string;
  onReschedule: (date: Date, time: string) => Promise<void>;
  isLoading: boolean;
}

export function RescheduleExamDialog({
  isOpen,
  onClose,
  appointmentId,
  examName,
  laboratoryExamId,
  currentDate,
  currentTime,
  onReschedule,
  isLoading,
}: RescheduleExamDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | undefined>();

  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedDate(undefined);
      setSelectedTime(undefined);
    }
  }, [isOpen]);

  // Fetch existing appointments for the selected date
  const { data: existingAppointments = [], isLoading: isLoadingSlots } = useQuery({
    queryKey: ["appointments", laboratoryExamId, selectedDate],
    queryFn: async () => {
      if (!selectedDate || !laboratoryExamId) return [];

      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      
      const { data, error } = await supabase
        .from("appointments")
        .select("appointment_time")
        .eq("laboratory_exam_id", laboratoryExamId)
        .eq("appointment_date", formattedDate)
        .neq("id", appointmentId); // Exclude the current appointment

      if (error) throw error;
      return data.map(apt => apt.appointment_time);
    },
    enabled: !!selectedDate && !!laboratoryExamId,
  });

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return;
    await onReschedule(selectedDate, selectedTime);
  };

  const dateHasChanged = selectedDate && format(selectedDate, "yyyy-MM-dd") !== currentDate;
  const timeHasChanged = selectedTime && selectedTime !== currentTime;
  const canReschedule = (dateHasChanged || timeHasChanged) && selectedDate && selectedTime;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Reschedule Exam</DialogTitle>
          <DialogDescription>
            You are rescheduling your appointment for <span className="font-semibold">{examName}</span>.
            Current date: {currentDate}, Time: {currentTime}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-4">
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

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleReschedule} 
            disabled={!canReschedule || isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isLoading ? "Rescheduling..." : "Confirm Reschedule"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
