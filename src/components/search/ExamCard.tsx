
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/context/LanguageContext";
import type { ExamResult } from "@/types/exam";

interface ExamCardProps {
  exam: ExamResult;
}

const ExamCard = ({ exam }: ExamCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <Card key={`${exam.exam_id}-${exam.laboratory_id}`} className="p-4">
      <h3 className="text-xl font-semibold mb-2">{exam.exam_name}</h3>
      <p className="text-muted-foreground mb-2">{exam.exam_description}</p>
      <p className="text-primary font-semibold mb-4">
        ${exam.exam_price.toFixed(2)}
      </p>
      <div className="border-t pt-4">
        <h4 className="font-semibold">{exam.laboratory_name}</h4>
        <p className="text-sm text-muted-foreground">{exam.laboratory_address}</p>
        <p className="text-sm text-muted-foreground">
          {exam.laboratory_city}, {exam.laboratory_state}
        </p>
      </div>
      <Button
        className="w-full mt-4"
        onClick={() =>
          navigate(`/schedule?exam=${exam.exam_id}&laboratory=${exam.laboratory_id}`)
        }
      >
        {t("search.scheduleExam")}
      </Button>
    </Card>
  );
};

export default ExamCard;
