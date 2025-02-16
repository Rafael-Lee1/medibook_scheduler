
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";

interface DateSelectorProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
}

export const DateSelector = ({ selectedDate, onDateSelect }: DateSelectorProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-4">Select Date</h2>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={onDateSelect}
        disabled={{ before: new Date() }}
        className="rounded-md border"
      />
    </Card>
  );
};
