
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const ExamNotFound = () => {
  const navigate = useNavigate();
  
  return (
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
  );
};
