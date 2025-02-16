
import { Card } from "@/components/ui/card";

interface ExamDetailsProps {
  exam: {
    name: string;
    description: string;
    preparation_instructions: string | null;
  };
  laboratory: {
    name: string;
    address: string;
    city: string;
    state: string;
  };
}

export const ExamDetails = ({ exam, laboratory }: ExamDetailsProps) => {
  return (
    <Card className="p-6 mb-6">
      <h1 className="text-2xl font-bold mb-4">Schedule Appointment</h1>
      <div className="mb-4">
        <h2 className="text-xl font-semibold">{exam.name}</h2>
        <p className="text-muted-foreground">{exam.description}</p>
        <div className="mt-4">
          <h3 className="font-semibold">Location</h3>
          <p>{laboratory.name}</p>
          <p className="text-muted-foreground">{laboratory.address}</p>
          <p className="text-muted-foreground">
            {laboratory.city}, {laboratory.state}
          </p>
        </div>
        {exam.preparation_instructions && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
            <h3 className="font-semibold mb-2">Preparation Instructions</h3>
            <p>{exam.preparation_instructions}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
