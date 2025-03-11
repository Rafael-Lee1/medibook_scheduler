
import ExamCard from "./ExamCard";
import { useLanguage } from "@/context/LanguageContext";
import type { ExamResult } from "@/types/exam";

interface ExamResultsProps {
  isLoading: boolean;
  examResults: ExamResult[];
  hasFilters: boolean;
}

const ExamResults = ({ isLoading, examResults, hasFilters }: ExamResultsProps) => {
  const { t } = useLanguage();
  
  if (isLoading) {
    return <p>{t("myExams.loading")}</p>;
  }

  if (examResults.length === 0) {
    return (
      <p className="text-center text-muted-foreground">
        {hasFilters 
          ? t("search.noResultsWithFilters") 
          : t("search.noResults")}
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
