"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Wand2, AlertCircle, RefreshCw, ChevronRight } from "lucide-react";
import type { OptimizationResult } from "@/lib/ai/gemini";
import Link from "next/link";

export default function JobOptimizationClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!jobDescription.trim()) {
      setError("Vui lòng nhập mô tả công việc (JD)");
      return;
    }

    setIsOptimizing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi tối ưu");
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể kết nối đến máy chủ AI");
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Wand2 className="h-8 w-8 text-primary" />
          Tối ưu hóa CV (AI Optimization)
        </h1>
        <p className="mt-2 text-text-muted">
          AI sẽ đọc CV của bạn và viết lại các phần Tóm tắt (Summary) và Kinh nghiệm (Experience) để chứa nhiều từ khóa ATS nhất.
        </p>
      </div>

      <div className="space-y-4 bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light">
        <label className="block text-sm font-semibold text-foreground">
          Mô tả công việc (Job Description)
        </label>
        <Textarea
          className="min-h-[200px] resize-y"
          placeholder="Dán nội dung JD vào đây..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          disabled={isOptimizing}
        />
        
        {error && (
          <div className="p-3 text-sm text-error bg-error-container/30 rounded-lg border border-error/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <Button 
          className="gap-2 text-base h-12 w-full sm:w-auto" 
          onClick={handleOptimize}
          disabled={isOptimizing}
        >
          {isOptimizing ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              Đang viết lại CV...
            </>
          ) : (
            <>
              <Wand2 className="h-5 w-5" />
              Tối ưu hóa ngay
            </>
          )}
        </Button>
      </div>

      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h2 className="text-xl font-bold text-foreground border-b border-border-light pb-2">
            Đề xuất bản thảo mới
          </h2>

          <div className="bg-surface-low p-6 rounded-2xl border border-primary/20 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
              Summary
            </div>
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Tóm tắt bản thân</h3>
            <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
              {result.improvedSummary}
            </p>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">Kinh nghiệm làm việc</h3>
            {result.improvedExperiences.map((exp, i) => (
              <div key={i} className="bg-surface-low p-6 rounded-2xl border border-primary/20 space-y-3 relative">
                <div className="absolute top-0 right-0 bg-primary/80 text-white text-xs font-bold px-3 py-1 rounded-bl-lg">
                  Experience
                </div>
                <div className="text-xs text-text-muted font-mono">ID: {exp.id}</div>
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-sm">
                  {exp.suggestedDescription}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <Link href="/my-cv">
              <Button variant="outline" className="gap-2">
                Quay lại Trình sửa CV
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
