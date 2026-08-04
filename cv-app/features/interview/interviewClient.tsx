"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { Mic, Send, MessageSquare, PlayCircle, Loader2 } from "lucide-react";

interface Question {
  id: string;
  questionText: string;
  expectedKeywords: string[];
  orderIndex: number;
}

interface Evaluation {
  score: number;
  feedback: string;
}

export default function InterviewClient() {
  const [jobDescription, setJobDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  const [answer, setAnswer] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({});
  
  const [error, setError] = useState<string | null>(null);

  const currentQuestion = questions[currentQuestionIndex];
  const hasStarted = questions.length > 0;
  const currentEvaluation = currentQuestion ? evaluations[currentQuestion.id] : null;

  const handleStart = async () => {
    if (!jobDescription.trim()) {
      setError("Vui lòng nhập JD để bắt đầu.");
      return;
    }
    
    setIsGenerating(true);
    setError(null);

    try {
      const res = await fetch("/api/ai/interview/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setEvaluations({});
      setAnswer("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!answer.trim() || !currentQuestion) return;
    
    setIsEvaluating(true);
    try {
      const res = await fetch("/api/ai/interview/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionText: currentQuestion.questionText,
          expectedKeywords: currentQuestion.expectedKeywords,
          answerText: answer,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      
      setEvaluations((prev) => ({
        ...prev,
        [currentQuestion.id]: data,
      }));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi chấm điểm");
    } finally {
      setIsEvaluating(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setAnswer("");
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center justify-center gap-3">
          <MessageSquare className="h-8 w-8 text-primary" />
          Phỏng vấn giả lập (Mock Interview)
        </h1>
        <p className="mt-2 text-text-muted">
          AI sẽ đóng vai nhà tuyển dụng và đưa ra câu hỏi sát nhất với JD và CV của bạn.
        </p>
      </div>

      {!hasStarted ? (
        <div className="bg-surface-white p-8 rounded-2xl shadow-sm border border-border-light max-w-2xl mx-auto space-y-6">
          <label className="block text-sm font-semibold text-foreground">
            Nhập JD để AI chuẩn bị bộ câu hỏi
          </label>
          <Textarea
            className="min-h-[200px]"
            placeholder="Dán JD vào đây..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button 
            className="w-full gap-2 h-12" 
            onClick={handleStart}
            disabled={isGenerating}
          >
            {isGenerating ? <Loader2 className="animate-spin h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
            Bắt đầu phỏng vấn
          </Button>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in zoom-in duration-500">
          {/* Progress Indicator */}
          <div className="flex justify-between items-center text-sm font-medium text-text-muted">
            <span>Câu hỏi {currentQuestionIndex + 1} / {questions.length}</span>
            {currentQuestionIndex === questions.length - 1 && currentEvaluation && (
              <span className="text-primary font-bold">Hoàn thành phỏng vấn!</span>
            )}
          </div>

          {/* Question Box */}
          <div className="bg-primary/5 border border-primary/20 p-6 rounded-2xl">
            <div className="flex gap-4">
              <div className="bg-primary text-white h-10 w-10 shrink-0 rounded-full flex items-center justify-center font-bold">
                AI
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-1">Nhà tuyển dụng</h3>
                <p className="text-foreground text-lg leading-relaxed">{currentQuestion.questionText}</p>
              </div>
            </div>
          </div>

          {/* Answer Box */}
          <div className="bg-surface-white p-6 rounded-2xl shadow-sm border border-border-light space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Mic className="h-4 w-4" /> Câu trả lời của bạn
              </label>
              <span className="text-xs text-text-muted">(Gõ văn bản để trả lời)</span>
            </div>
            
            <Textarea
              className="min-h-[150px] text-base"
              placeholder="Trả lời ở đây..."
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={isEvaluating || !!currentEvaluation}
            />

            {!currentEvaluation ? (
              <div className="flex justify-end">
                <Button 
                  onClick={handleSubmitAnswer} 
                  disabled={isEvaluating || !answer.trim()}
                  className="gap-2"
                >
                  {isEvaluating ? <Loader2 className="animate-spin h-4 w-4" /> : <Send className="h-4 w-4" />}
                  Gửi câu trả lời
                </Button>
              </div>
            ) : (
              <div className="space-y-4 mt-6 animate-in slide-in-from-top-2">
                <div className={`p-4 rounded-xl border ${currentEvaluation.score >= 7 ? 'bg-success-container/30 border-success/30' : 'bg-warning-container/30 border-warning/30'}`}>
                  <h4 className="font-bold text-foreground mb-2 flex justify-between">
                    <span>Đánh giá từ AI</span>
                    <span className="text-lg">{currentEvaluation.score}/10 Điểm</span>
                  </h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{currentEvaluation.feedback}</p>
                </div>
                
                {currentQuestionIndex < questions.length - 1 && (
                  <div className="flex justify-end">
                    <Button onClick={nextQuestion}>Câu tiếp theo</Button>
                  </div>
                )}
              </div>
            )}
            {error && <p className="text-sm text-error mt-2">{error}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
