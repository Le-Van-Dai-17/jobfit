import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-[60vh] w-full flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-surface-container-high p-4">
        <FileQuestion className="h-10 w-10 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-foreground">Không tìm thấy trang</h2>
      <p className="text-text-muted max-w-md mb-4">
        Trang bạn đang cố truy cập không tồn tại hoặc đã bị di chuyển.
      </p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
      >
        Về trang chủ
      </Link>
    </div>
  );
}
