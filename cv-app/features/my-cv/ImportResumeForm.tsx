"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { FileUp, ImageIcon, Upload, X } from "lucide-react";

import { Input } from "@/components/ui/Input";
import { importResumeAction } from "./actions/import-resume";

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ImportResumeForm() {
  const [state, formAction, pending] = useActionState(importResumeAction, {});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{ name: string; size: number; url: string } | null>(null);

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage.url);
    };
  }, [selectedImage]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    setSelectedImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      if (!file || !file.type.startsWith("image/")) return null;
      return { name: file.name, size: file.size, url: URL.createObjectURL(file) };
    });
  }

  function clearSelectedFile() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setSelectedImage((current) => {
      if (current) URL.revokeObjectURL(current.url);
      return null;
    });
  }

  return (
    <form action={formAction} className="rounded-2xl border border-border-light bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-white">
          <FileUp className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-foreground">Import CV có sẵn</h2>
          <p className="mt-1 text-sm leading-6 text-text-muted">
            Tải file text/markdown/ảnh CV hoặc dán nội dung CV đã có để tạo nhanh một CV snapshot mới.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>Tên CV</span>
          <Input name="title" required minLength={2} maxLength={120} placeholder="Ví dụ: CV Backend import từ PDF" />
        </label>

        <label className="block space-y-1.5 text-sm font-semibold text-foreground">
          <span>File CV</span>
          <Input
            ref={fileInputRef}
            name="resumeFile"
            type="file"
            accept=".txt,.md,.markdown,.json,.jpg,.jpeg,.png,text/plain,text/markdown,application/json,image/jpeg,image/png"
            onChange={handleFileChange}
          />
        </label>
      </div>

      {selectedImage ? (
        <section className="mt-4 rounded-xl border border-outline-variant bg-surface-low p-3" aria-label="Ảnh CV đã chọn">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div
              role="img"
              aria-label={`Xem trước ${selectedImage.name}`}
              className="h-56 w-full rounded-lg border border-outline-variant bg-white bg-contain bg-center bg-no-repeat sm:w-44"
              style={{ backgroundImage: `url(${selectedImage.url})` }}
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-start gap-2">
                <ImageIcon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{selectedImage.name}</p>
                  <p className="mt-1 text-xs text-text-muted">{formatFileSize(selectedImage.size)} · kiểm tra đúng ảnh trước khi import</p>
                </div>
              </div>
              <button
                type="button"
                onClick={clearSelectedFile}
                className="mt-4 inline-flex items-center gap-2 rounded-lg border border-outline-variant px-3 py-2 text-sm font-semibold text-primary hover:bg-surface-white"
              >
                <X className="h-4 w-4" />
                Bỏ chọn ảnh
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <label className="mt-4 block space-y-1.5 text-sm font-semibold text-foreground">
        <span>Nội dung CV</span>
        <textarea
          name="resumeText"
          rows={8}
          className="w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-text-muted focus:border-primary focus:ring-2 focus:ring-primary/20"
          placeholder="Nếu CV là PDF/DOCX, bạn có thể copy nội dung và dán vào đây. Với JPG/PNG, hệ thống sẽ đọc chữ từ ảnh nếu đã cấu hình Gemini."
        />
      </label>

      {state.error ? <p className="mt-4 rounded-lg bg-error-container p-3 text-sm font-medium text-error">{state.error}</p> : null}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-secondary px-5 text-sm font-semibold text-white hover:bg-secondary-container disabled:opacity-70"
        >
          <Upload className="h-4 w-4" />
          {pending ? "Đang import..." : "Import CV"}
        </button>
        <p className="text-xs leading-5 text-text-muted">Hỗ trợ .txt/.md/.json và JPG/PNG dưới 2MB. PDF/DOCX nên copy text rồi dán vào ô nội dung.</p>
      </div>
    </form>
  );
}
