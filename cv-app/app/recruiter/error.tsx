"use client";

export default function RecruiterError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="rounded-xl border border-border-light bg-surface-white p-5">
      <h2 className="text-lg font-bold text-foreground">Không thể tải dữ liệu nhà tuyển dụng</h2>
      <button className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={reset}>
        Thử lại
      </button>
    </div>
  );
}
