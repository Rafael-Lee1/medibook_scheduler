
import ExamCard from "./ExamCard";
import type { ExamResult } from "@/types/exam";

interface ExamResultsProps {
  isLoading: boolean;
  examResults: ExamResult[];
  hasFilters: boolean;
}

const ExamResults = ({ isLoading, examResults, hasFilters }: ExamResultsProps) => {
  if (isLoading) {
    return <p>Loading exams...</p>;
  }

  if (examResults.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        {hasFilters 
          ? "No exams found matching your search criteria. Try adjusting your filters."
          : "No exams found. Please try a different search."}
      </p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {examResults.map((result) => (
        <ExamCard key={`${result.exam_id}-${result.laboratory_id}`} exam={result} />
      ))}
    </div>
  );
};

export default ExamResults;
