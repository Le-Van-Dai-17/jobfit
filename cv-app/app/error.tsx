"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-error-container p-4">
        <AlertTriangle className="h-8 w-8 text-error" />
      </div>
      <h2 className="text-xl font-bold text-foreground">Đã xảy ra lỗi hệ thống</h2>
      <p className="text-text-muted max-w-md">
        Rất tiếc, đã có lỗi bất ngờ xảy ra trong quá trình xử lý yêu cầu của bạn.
      </p>
      <button
        onClick={() => reset()}
        className="mt-4 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
