import { Check, X } from "lucide-react";
import type { ApplicationStatus } from "@prisma/client";

const steps = [
  { id: "SUBMIT_CV", label: "Nộp hồ sơ" },
  { id: "ASSESSMENT", label: "Làm bài test" },
  { id: "COMPLETED", label: "Hoàn tất" },
];

export function ApplicationStepper({
  hasResume,
  hasTestResult,
  status
}: {
  hasResume: boolean;
  hasTestResult: boolean;
  status: ApplicationStatus;
}) {
  let activeIndex = 0;

  if (hasResume) {
    activeIndex = 1;
  }
  if (hasTestResult) {
    activeIndex = 2;
  }

  const isRejected = status === "REJECTED";
  const isWithdrawn = status === "WITHDRAWN";
  const isTerminal = isRejected || isWithdrawn;

  return (
    <div className="w-full mt-4">
      <div className="flex justify-between relative isolate">
        {steps.map((step, index) => {
          // If terminal, the process stops at the current active index.
          const isFailed = isTerminal && index === activeIndex;
          const isCompleted = !isFailed && (index < activeIndex || (index === 2 && activeIndex === 2));
          const isCurrent = index === activeIndex && !isCompleted && !isFailed;

          return (
            <div key={step.id} className="flex-1 flex flex-col items-center relative">
              {/* Connecting Line (drawn from center of previous to center of current) */}
              {index > 0 && (
                <div
                  className={`absolute top-4 right-1/2 w-full h-[2px] -z-10 ${
                    index <= activeIndex && !isFailed && !isTerminal ? "bg-primary" : "bg-outline-variant"
                  }`}
                />
              )}

              {/* Circle */}
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                isCompleted
                  ? "border-primary bg-primary text-white"
                  : isFailed
                  ? "border-error bg-error text-white"
                  : isCurrent
                  ? "border-primary bg-surface-white text-primary"
                  : "border-outline-variant bg-surface-white text-text-muted"
              }`}>
                {isCompleted ? (
                  <Check className="w-5 h-5" strokeWidth={3} />
                ) : isFailed ? (
                  <X className="w-5 h-5" strokeWidth={3} />
                ) : (
                  <span className="font-bold text-sm">{index + 1}</span>
                )}
              </div>

              {/* Label */}
              <p className={`mt-3 text-xs md:text-sm font-semibold text-center ${
                isCompleted || isCurrent ? "text-foreground" : isFailed ? "text-error" : "text-text-muted"
              }`}>
                {isFailed ? (isRejected ? "Bị từ chối" : "Đã rút đơn") : step.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
