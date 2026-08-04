"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Sparkles, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import type { MatchAnalysisResult } from "@/lib/ai/gemini";

export default function JobMatchClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<MatchAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) {
      setError("Vui lòng nhập mô tả công việc (JD)");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Có lỗi xảy ra khi phân tích");
      }

      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Không thể kết nối đến máy chủ AI");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <Sparkles className="h-8 w-8 text-primary" />
          Phân tích độ phù hợp (Match Analysis)
        </h1>
        <p className="mt-2 text-text-muted">
          Dán mô tả công việc (JD) vào bên dưới, AI sẽ so sánh với CV hiện tại của bạn và đưa ra điểm số.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Input */}
        <div className="space-y-4">
          <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <label className="block text-sm font-semibold text-foreground">
              Mô tả công việc (Job Description)
            </label>
            <Textarea
              className="min-h-[300px] resize-y"
              placeholder="Dán nội dung JD vào đây..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              disabled={isAnalyzing}
            />
            
            {error && (
              <div className="p-3 text-sm text-error bg-error-container/30 rounded-lg border border-error/20 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <Button 
              className="w-full gap-2 text-base h-12" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5" />
                  Phân tích CV
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="space-y-6">
          {!result && !isAnalyzing && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-surface-low rounded-2xl border border-dashed border-border-light text-text-muted">
              <Sparkles className="h-12 w-12 text-border-base mb-4 opacity-50" />
              <p>Kết quả phân tích sẽ hiển thị tại đây</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-surface-low rounded-2xl border border-border-light">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-4" />
              <p className="text-foreground font-medium animate-pulse">
                AI đang đọc và phân tích CV của bạn...
              </p>
            </div>
          )}

          {result && !isAnalyzing && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
              {/* Score Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light text-center">
                  <div className="text-sm font-medium text-text-muted mb-2">Độ phù hợp tổng thể</div>
                  <div className="text-5xl font-black gradient-text">{result.overallScore}%</div>
                </div>
                <div className="grid grid-rows-3 gap-2">
                  <div className="bg-surface-white px-4 py-2 rounded-xl shadow-sm border border-border-light flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted">Từ khóa (Keywords)</span>
                    <span className="text-sm font-bold text-foreground">{result.keywordMatch}%</span>
                  </div>
                  <div className="bg-surface-white px-4 py-2 rounded-xl shadow-sm border border-border-light flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted">Kinh nghiệm (Experience)</span>
                    <span className="text-sm font-bold text-foreground">{result.experienceMatch}%</span>
                  </div>
                  <div className="bg-surface-white px-4 py-2 rounded-xl shadow-sm border border-border-light flex items-center justify-between">
                    <span className="text-xs font-medium text-text-muted">Kỹ năng (Skills)</span>
                    <span className="text-sm font-bold text-foreground">{result.skillsMatch}%</span>
                  </div>
                </div>
              </div>

              {/* Keyword Analysis */}
              <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light space-y-6">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                    Từ khóa đã có
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-success-container/30 text-success-heavy text-xs font-medium rounded-full border border-success/20">
                        {kw}
                      </span>
                    ))}
                    {result.matchedKeywords.length === 0 && <span className="text-sm text-text-muted">Không tìm thấy từ khóa nào.</span>}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2 mb-3">
                    <AlertCircle className="h-5 w-5 text-warning" />
                    Từ khóa còn thiếu
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingKeywords.map((kw, i) => (
                      <span key={i} className="px-3 py-1 bg-warning-container/30 text-warning-heavy text-xs font-medium rounded-full border border-warning/20">
                        {kw}
                      </span>
                    ))}
                    {result.missingKeywords.length === 0 && <span className="text-sm text-text-muted">CV đã bao phủ rất tốt JD!</span>}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Gợi ý cải thiện từ AI
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm text-slate-700 leading-relaxed">
                      <span className="flex shrink-0 h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                        {i + 1}
                      </span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
