"use client";

import { useEffect, useState } from "react";
import { CvEditor } from "@/features/cv/components/CvEditor";
import { CvPreview } from "@/features/cv/components/CvPreview";
import { useCvStore } from "@/features/cv/store/useCvStore";
import { saveCvAction } from "@/features/cv/actions/save-cv";
import { Button } from "@/components/ui/Button";
import { Save, FileText, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { CvData } from "@/features/cv/schemas/cv.schema";

interface MyCvClientProps {
  initialResumeId?: string;
  initialData?: Partial<CvData> | null;
}

export default function MyCvClient({ initialResumeId, initialData }: MyCvClientProps) {
  const { setCvData, cvData, isDirty, resetDirty } = useCvStore();
  const [isSaving, setIsSaving] = useState(false);

  // Load initial data (mocking for now if none provided)
  useEffect(() => {
    if (initialData) {
      setCvData(initialData as CvData);
    }
  }, [initialData, setCvData]);

  const handleSave = async () => {
    if (!initialResumeId) {
      alert("Cannot save: No resume ID found. Please create one from Dashboard.");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveCvAction(initialResumeId, cvData);
      if (result.success) {
        resetDirty();
        alert("Đã lưu CV thành công!"); // Temporary alert
      } else {
        alert("Lỗi khi lưu: " + result.error);
      }
    } catch {
      alert("Có lỗi xảy ra khi kết nối server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-surface-base">
      {/* Top Navbar specifically for Editor */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border-light bg-surface-white px-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 text-text-muted">
              <LayoutDashboard className="h-4 w-4" />
              Bảng điều khiển
            </Button>
          </Link>
          <div className="h-4 w-px bg-border-light" />
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <FileText className="h-4 w-4 text-primary" />
            <span>Frontend Developer CV - 2024</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isDirty && <span className="text-xs text-warning font-medium">Chưa lưu thay đổi</span>}
          <Button 
            onClick={handleSave} 
            disabled={!isDirty || isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "Đang lưu..." : "Lưu CV"}
          </Button>
        </div>
      </header>

      {/* Main Split View */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left Pane: Editor (Form) */}
        <div className="w-1/2 border-r border-border-light bg-surface-white h-full relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
          <CvEditor />
        </div>

        {/* Right Pane: Live Preview */}
        <div className="w-1/2 h-full bg-slate-100">
          <CvPreview />
        </div>
      </main>
    </div>
  );
}
