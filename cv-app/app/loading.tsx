export default function Loading() {
  return (
    <div className="flex h-[50vh] w-full flex-col items-center justify-center gap-4">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-text-muted animate-pulse">Đang tải dữ liệu...</p>
    </div>
  );
}
