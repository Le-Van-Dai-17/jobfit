export function PageSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="animate-pulse space-y-5" aria-label="?ang t?i n?i dung">
      <section className="rounded-2xl bg-surface-white p-5 shadow-card md:p-7">
        <div className="h-4 w-28 rounded bg-surface-container-highest" />
        <div className="mt-4 h-8 w-2/3 max-w-lg rounded bg-surface-container-highest" />
        <div className="mt-3 h-4 w-full max-w-2xl rounded bg-surface-container" />
      </section>
      <div className={compact ? "grid gap-4" : "grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]"}>
        <div className="space-y-4">
          {[0, 1, 2].map((item) => (
            <div key={item} className="rounded-xl bg-surface-white p-5 shadow-card">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-lg bg-surface-container-highest" />
                <div className="min-w-0 flex-1 space-y-3">
                  <div className="h-5 w-2/3 rounded bg-surface-container-highest" />
                  <div className="h-4 w-1/2 rounded bg-surface-container" />
                  <div className="h-4 w-full rounded bg-surface-container" />
                </div>
              </div>
            </div>
          ))}
        </div>
        {!compact ? (
          <aside className="hidden space-y-4 lg:block">
            <div className="h-36 rounded-xl bg-surface-white shadow-card" />
            <div className="h-28 rounded-xl bg-surface-white shadow-card" />
          </aside>
        ) : null}
      </div>
    </div>
  );
}
