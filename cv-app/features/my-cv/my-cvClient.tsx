"use client";

import { FileText, Save } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/Button";
import { saveCvAction } from "@/features/cv/actions/save-cv";
import { CvEditor } from "@/features/cv/components/CvEditor";
import { CvPreview } from "@/features/cv/components/CvPreview";
import type { CvData } from "@/features/cv/schemas/cv.schema";
import { useCvStore } from "@/features/cv/store/useCvStore";

interface MyCvClientProps {
  initialResumeId?: string;
  initialTitle: string;
  initialData?: Partial<CvData> | null;
}

export default function MyCvClient({ initialResumeId, initialTitle, initialData }: MyCvClientProps) {
  const { setCvData, cvData, isDirty, resetDirty } = useCvStore();
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (initialData) {
      setCvData(initialData as CvData);
    }
  }, [initialData, setCvData]);

  const handleSave = async () => {
    if (!initialResumeId) {
      setStatus({ type: "error", message: "Không tìm thấy CV để lưu. Vui lòng tạo CV mới." });
      return;
    }

    setIsSaving(true);
    setStatus(null);
    try {
      const result = await saveCvAction(initialResumeId, cvData);
      if (result.success) {
        resetDirty();
        setStatus({ type: "success", message: "Đã lưu CV và tạo phiên bản mới." });
      } else {
        setStatus({ type: "error", message: result.error ?? "Không thể lưu CV lúc này." });
      }
    } catch {
      setStatus({ type: "error", message: "Không thể kết nối máy chủ. Vui lòng thử lại sau." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-7rem)] w-full flex-col overflow-hidden rounded-xl border border-border-light bg-surface-white shadow-sm">
      <header className="flex shrink-0 flex-col gap-3 border-b border-border-light bg-surface-white p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex min-w-0 items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">{initialTitle}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isDirty ? <span className="text-xs font-medium text-text-muted">Chưa lưu thay đổi</span> : null}
          <Button onClick={handleSave} disabled={!isDirty || isSaving} isLoading={isSaving} className="gap-2">
            <Save className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu CV"}
          </Button>
        </div>

        {status ? (
          <p
            role={status.type === "error" ? "alert" : "status"}
            className={status.type === "error" ? "text-sm font-medium text-error" : "text-sm font-medium text-tertiary"}
          >
            {status.message}
          </p>
        ) : null}
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-2">
        <div className="min-h-[540px] border-b border-border-light bg-surface-white lg:border-b-0 lg:border-r">
          <CvEditor />
        </div>
        <div className="min-h-[540px] bg-surface-low">
          <CvPreview />
        </div>
      </main>
    </div>
  );
}
