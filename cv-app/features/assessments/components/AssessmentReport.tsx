import type { Prisma } from "@prisma/client";

import { AssessmentEvaluationSchema } from "../schemas/assessment.schema";

type Result = {
  advisoryScore: number;
  rubricBreakdown: Prisma.JsonValue;
  strengths: string[];
  gaps: string[];
  evidence: Prisma.JsonValue;
  limitations: string[];
  reportSummary: string;
  evaluatorModel: string;
  promptVersion: string;
};

export function AssessmentReport({ result }: { result: Result }) {
  const parsed = AssessmentEvaluationSchema.pick({
    rubricBreakdown: true,
    evidence: true,
  }).parse({
    rubricBreakdown: result.rubricBreakdown,
    evidence: result.evidence,
  });

  return (
    <section className="space-y-4">
      <div className="rounded-lg border border-border-light bg-surface-white p-4">
        <p className="text-xs font-semibold uppercase text-text-muted">Báo cáo an toàn cho nhà tuyển dụng</p>
        <div className="mt-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-foreground">Điểm tư vấn: {result.advisoryScore}/100</h2>
            <p className="mt-1 text-sm leading-6 text-text-muted">{result.reportSummary}</p>
          </div>
          <div className="rounded-md bg-surface-low px-3 py-2 text-xs text-text-muted">
            {result.evaluatorModel} - {result.promptVersion}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border border-border-light bg-surface-white p-4">
          <h3 className="font-bold text-foreground">Điểm mạnh</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
            {result.strengths.map((item, index) => (
              <li key={`strength-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-border-light bg-surface-white p-4">
          <h3 className="font-bold text-foreground">Khoảng trống</h3>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-foreground">
            {result.gaps.map((item, index) => (
              <li key={`gap-${index}-${item}`}>{item}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg border border-border-light bg-surface-white p-4">
        <h3 className="font-bold text-foreground">Rubric</h3>
        <div className="mt-3 space-y-3">
          {parsed.rubricBreakdown.map((task) => (
            <div key={task.taskId} className="rounded-md bg-surface-low p-3">
              <p className="font-semibold text-foreground">{task.taskTitle}</p>
              <div className="mt-2 grid gap-2 md:grid-cols-2">
                {task.scores.map((score) => (
                  <div key={`${task.taskId}-${score.criterionId}`} className="rounded-md bg-white p-3 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{score.label}</span>
                      <span className="text-primary">{score.score}/{score.maxScore}</span>
                    </div>
                    {score.gap && <p className="mt-1 text-text-muted">{score.gap}</p>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-border-light bg-surface-white p-4">
        <h3 className="font-bold text-foreground">Bằng chứng sử dụng</h3>
        <ul className="mt-3 space-y-3">
          {parsed.evidence.map((item, index) => (
            <li key={`${item.taskId}-${item.quote}-${index}`} className="rounded-md bg-surface-low p-3 text-sm">
              <p className="text-foreground">&quot;{item.quote}&quot;</p>
              <p className="mt-1 text-text-muted">{item.rationale}</p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <h3 className="font-bold text-amber-900">Giới hạn</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-amber-900">
          {result.limitations.map((item, index) => (
            <li key={`limitation-${index}-${item}`}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
