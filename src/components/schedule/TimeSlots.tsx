
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30"
];

interface TimeSlotsProps {
  selectedDate: Date | undefined;
  selectedTime: string | undefined;
  existingAppointments: string[];
  onTimeSelect: (time: string) => void;
}

export const TimeSlots = ({
  selectedDate,
  selectedTime,
  existingAppointments,
  onTimeSelect,
}: TimeSlotsProps) => {
  return (
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
                onClick={() => onTimeSelect(time)}
              >
                {time}
              </Button>
            );
          })}
        </div>
      )}
    </Card>
  );
};
