import type { Prisma } from "@prisma/client";
import { AssessmentEvaluationSchema } from "@/features/assessments/schemas/assessment.schema";

type EmployerReport = {
  advisoryScore: number;
  reportSummary: string;
  strengths: string[];
  gaps: string[];
  limitations: string[];
  rubricBreakdown: Prisma.JsonValue;
  evidence: Prisma.JsonValue;
};

export function EmployerAssessmentReport({ result }: { result: EmployerReport }) {
  const parsed = AssessmentEvaluationSchema.pick({ rubricBreakdown: true, evidence: true }).parse({
    rubricBreakdown: result.rubricBreakdown,
    evidence: result.evidence,
  });

  return (
    <div className="space-y-5">
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Điểm tư vấn: {result.advisoryScore}/100</h2>
        <p className="mt-2 text-sm text-text-muted">{result.reportSummary}</p>
      </section>
      <section className="grid gap-4 md:grid-cols-3">
        {[["Điểm mạnh", result.strengths], ["Khoảng trống", result.gaps], ["Giới hạn", result.limitations]].map(([title, items]) => (
          <div key={title as string} className="rounded-xl border border-border-light bg-white p-5">
            <h2 className="font-semibold">{title as string}</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-muted">
              {(items as string[]).map((item, index) => <li key={`${title}-${index}-${item}`}>{item}</li>)}
            </ul>
          </div>
        ))}
      </section>
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Rubric</h2>
        <div className="mt-3 space-y-3">
          {parsed.rubricBreakdown.map((task) => (
            <div key={task.taskId} className="rounded-lg bg-surface-low p-4">
              <p className="font-semibold">{task.taskTitle}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {task.scores.map((score) => (
                  <div key={`${task.taskId}-${score.criterionId}`} className="rounded-lg bg-white p-3 text-sm">
                    <div className="flex justify-between gap-3"><span className="font-semibold">{score.label}</span><span>{score.score}/{score.maxScore}</span></div>
                    {score.gap ? <p className="mt-1 text-text-muted">{score.gap}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border border-border-light bg-white p-5">
        <h2 className="font-semibold">Bằng chứng sử dụng</h2>
        <ul className="mt-3 space-y-3">
          {parsed.evidence.map((item, index) => (
            <li key={`${item.taskId}-${index}-${item.quote}`} className="rounded-lg bg-surface-low p-3 text-sm">
              <p>&quot;{item.quote}&quot;</p><p className="mt-1 text-text-muted">{item.rationale}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
