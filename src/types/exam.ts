
export type ExamType = "blood_test" | "x_ray" | "mri" | "ct_scan" | "ultrasound" | "endoscopy" | "colonoscopy" | "mammogram" | "other";

export type ExamResult = {
  exam_id: string;
  exam_name: string;
  exam_type: ExamType;
  exam_description: string;
  exam_price: number;
  laboratory_id: string;
  laboratory_name: string;
  laboratory_address: string;
  laboratory_city: string;
  laboratory_state: string;
};
