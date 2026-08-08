"use client";

import { useActionState } from "react";
import { Send } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { initialAssessmentActionState, submitAssessmentAction } from "../actions/assessment.actions";

type Task = {
  id: string;
  title: string;
  prompt: string;
  skills: string[];
  expectedEvidence: string[];
};

export function AssessmentSubmissionForm({ sessionId, tasks }: { sessionId: string; tasks: Task[] }) {
  const [state, formAction, pending] = useActionState(submitAssessmentAction, initialAssessmentActionState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="sessionId" value={sessionId} />
      {tasks.map((task, index) => (
        <section key={task.id} className="rounded-lg border border-border-light bg-surface-white p-4">
          <input type="hidden" name="taskId" value={task.id} />
          <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-text-muted">Bài {index + 1}</p>
              <h2 className="text-lg font-bold text-foreground">{task.title}</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              {task.skills.map((skill) => (
                <span key={skill} className="rounded-full bg-surface-low px-2.5 py-1 text-xs font-semibold text-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
          <p className="mb-3 text-sm leading-6 text-text-muted">{task.prompt}</p>
          <div className="mb-3 rounded-md bg-surface-low p-3">
            <p className="text-xs font-semibold uppercase text-text-muted">Bằng chứng nên có</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-foreground">
              {task.expectedEvidence.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <label htmlFor={`answer-${task.id}`} className="mb-2 block text-sm font-semibold text-foreground">
            Câu trả lời / giải thích giải pháp
          </label>
          <Textarea
            id={`answer-${task.id}`}
            name={`answer-${task.id}`}
            rows={8}
            minLength={120}
            maxLength={12000}
            required
            disabled={pending}
            placeholder="Mô tả cách bạn phân tích, thiết kế, triển khai, kiểm thử và xử lý rủi ro..."
          />
        </section>
      ))}

      {state.status === "error" && (
        <p className="rounded-md bg-red-50 p-3 text-sm text-red-700" aria-live="polite">
          {state.message}
        </p>
      )}

      <Button type="submit" isLoading={pending}>
        <Send className="mr-2 h-4 w-4" />
        Nộp và nhận đánh giá
      </Button>
    </form>
  );
}
