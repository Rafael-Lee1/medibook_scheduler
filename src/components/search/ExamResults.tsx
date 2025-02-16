
import ExamCard from "./ExamCard";
import type { ExamResult } from "@/types/exam";

interface ExamResultsProps {
  isLoading: boolean;
  examResults: ExamResult[];
}

const ExamResults = ({ isLoading, examResults }: ExamResultsProps) => {
  if (isLoading) {
    return <p>Loading exams...</p>;
  }

  if (examResults.length === 0) {
    return <p>No exams found. Try adjusting your search criteria.</p>;
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
