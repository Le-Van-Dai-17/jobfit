"use client";

import { Button } from "@/components/ui/Button";

export default function AssessmentsError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
      <h2 className="font-bold text-red-800">Không thể tải đánh giá</h2>
      <p className="mt-2 text-sm text-red-700">Vui lòng thử lại hoặc quay lại sau.</p>
      <Button type="button" variant="outline" className="mt-4" onClick={unstable_retry}>
        Thử lại
      </Button>
    </div>
  );
}
