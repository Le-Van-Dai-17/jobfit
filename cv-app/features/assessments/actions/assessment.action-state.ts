export type AssessmentActionState = {
  status: "idle" | "error";
  message?: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAssessmentActionState: AssessmentActionState = { status: "idle" };
