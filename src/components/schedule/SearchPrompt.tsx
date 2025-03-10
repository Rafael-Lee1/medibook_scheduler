
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const SearchPrompt = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Schedule an Appointment</h1>
      <p className="text-muted-foreground mb-6">
        To schedule an appointment, first search for and select an exam from our available options.
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
