"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/Button";

export default function AssessmentsError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 text-red-700" aria-hidden="true" />
        <div>
          <h2 className="font-bold text-red-800">Không thể tải đánh giá</h2>
          <p className="mt-2 text-sm text-red-700">
            Máy chủ chưa xử lý được dữ liệu đánh giá. Vui lòng thử lại hoặc quay lại sau.
          </p>
        </div>
      </div>
      <Button type="button" variant="outline" className="mt-4 gap-2" onClick={reset}>
        <RotateCcw className="h-4 w-4" />
        Thử lại
      </Button>
    </div>
  );
}
