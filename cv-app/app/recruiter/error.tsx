"use client";

export default function RecruiterError({ unstable_retry }: { error: Error & { digest?: string }; unstable_retry: () => void }) {
  return (
    <div className="rounded-xl border border-border-light bg-surface-white p-5">
      <h2 className="text-lg font-bold text-foreground">Khong the tai du lieu nha tuyen dung</h2>
      <button className="mt-3 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white" onClick={unstable_retry}>
        Thu lai
      </button>
    </div>
  );
}
