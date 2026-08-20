"use client";

import { useState, useActionState, useEffect, useTransition } from "react";
import {
  Code2,
  TerminalSquare,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Info,
  FolderOpen,
  Folder,
  FileCode,
  FileText,
  X,
  Send,
  Play,
  Loader2,
  Database
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitAssessmentAction, simulateCodeExecutionAction, type SimulationResult } from "../actions/assessment.actions";
import { initialAssessmentActionState } from "../actions/assessment.action-state";
import { Prisma } from "@prisma/client";

type Task = {
  id: string;
  title: string;
  prompt: string;
  skills: string[];
  expectedEvidence: string[];
  rubric: Prisma.JsonValue;
};

import type { Scenario } from "../services/scenario-bank";

export function AssessmentIDE({ sessionId, roleTitle, tasks, scenario }: { sessionId: string; roleTitle: string; tasks: Task[]; scenario: Scenario }) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitAssessmentAction, initialAssessmentActionState);

  const [activeTaskId, setActiveTaskId] = useState<string>(tasks[0]?.id || "");
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    return tasks.length > 0 ? { [tasks[0].id]: scenario.files[0]?.content || "" } : {};
  });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);

  // Terminal and Simulation State
  const [isSimulating, startSimulation] = useTransition();
  const [simulationResults, setSimulationResults] = useState<Record<string, SimulationResult>>({});
  const [activeTab, setActiveTab] = useState<"terminal" | "tests" | "database">("terminal");

  // Removed redundant legacy code init effect

  // When submission completes successfully, show success modal
  useEffect(() => {
    if (state.status === "success") {
      // eslint-disable-next-line
      setShowSubmitModal(false);
      // eslint-disable-next-line
      setShowSuccessModal(true);
    }
  }, [state.status]);

  const activeTask = tasks.find(t => t.id === activeTaskId);
  const currentSimResult = simulationResults[activeTaskId];

  const handleRunCode = () => {
    const code = answers[activeTaskId] || "";
    startSimulation(async () => {
      const result = await simulateCodeExecutionAction(code, activeTaskId);
      setSimulationResults(prev => ({ ...prev, [activeTaskId]: result }));
      setActiveTab("tests"); // auto switch to tests tab to show results
    });
  };

  return (
    <form action={formAction} className="fixed inset-0 z-50 flex flex-col bg-white overflow-hidden text-[13px] font-sans">
      <input type="hidden" name="sessionId" value={sessionId} />
      {tasks.map(task => (
        <div key={task.id}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name={`answer-${task.id}`} value={answers[task.id] || ""} />
        </div>
      ))}

      {/* Header */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 font-bold text-foreground text-base">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-[#0047AB] text-white">
              <Code2 className="h-4 w-4" />
            </div>
            KaDa
          </div>
          <div className="h-4 w-px bg-gray-300" />
          <h1 className="font-bold text-foreground text-sm">Bài test kỹ thuật – {roleTitle}</h1>
          <span className="flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            Assessment in progress
          </span>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Clock className="h-4 w-4" />
            Còn lại: 119:59
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-text-muted">{tasks.length} bài tập</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setShowExitModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-gray-50"
            >
              Thoát
            </button>
            <button
              type="button"
              onClick={() => setShowSubmitModal(true)}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#0047AB] px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-blue-800"
            >
              Nộp bài làm
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left Sidebar (Instructions & Explorer) */}
        <aside className="flex w-[300px] shrink-0 flex-col border-r border-gray-200 bg-gray-50/50">
          <div className="flex h-12 items-center gap-2 border-b border-gray-200 px-4 font-bold text-foreground">
            <Code2 className="h-4 w-4" /> Đề bài
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {activeTask && (
              <>
                <h2 className="text-sm font-bold text-[#0047AB] uppercase tracking-wider mb-1">
                  Bài {tasks.findIndex(t => t.id === activeTask.id) + 1}
                </h2>
                <h3 className="text-sm font-bold text-foreground leading-tight mb-3">{activeTask.title}</h3>
                <div className="text-text-muted leading-relaxed whitespace-pre-wrap text-xs">
                  {activeTask.prompt}
                </div>

                <h4 className="mt-4 mb-2 text-xs font-bold text-foreground">Yêu cầu cần đạt</h4>
                <ul className="space-y-2 text-text-muted text-xs">
                  {activeTask.expectedEvidence.map((evidence, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <div className="h-3.5 w-3.5 rounded-full border border-gray-400 mt-0.5 shrink-0 flex items-center justify-center">
                        <div className="h-1.5 w-1.5 rounded-full bg-transparent" />
                      </div>
                      {evidence}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          <div className="flex h-10 items-center justify-between border-y border-gray-200 bg-white px-4 font-bold text-foreground">
            Repository
          </div>

          <div className="h-1/3 overflow-y-auto p-4 bg-white text-xs text-foreground font-mono">
            <div className="flex items-center gap-2 font-bold mb-2"><FolderOpen className="h-4 w-4 text-[#0047AB]" /> {scenario.title}</div>
            <div className="pl-4 space-y-2">
              <div className="flex items-center gap-2 font-bold text-yellow-600"><Folder className="h-4 w-4" /> src</div>
              <div className="pl-4 space-y-2">
                {scenario.files.map((file, idx) => (
                  <button
                    key={idx}
                    type="button"
                    // Just a visual display, or we could make it active file
                    className={`w-full flex items-center gap-2 px-2 py-1 rounded text-left bg-blue-50 text-blue-700 font-bold`}
                  >
                    <FileCode className={`h-4 w-4 shrink-0 text-blue-500`} />
                    {file.path.replace('src/', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Middle Area (Editor & Terminal) */}
        <main className="flex flex-1 flex-col min-w-0 bg-white">
          {/* Editor Tabs */}
          <div className="flex h-10 shrink-0 border-b border-gray-200 bg-gray-50/50 px-2 overflow-x-auto">
            {tasks.map((task, idx) => (
              <button
                key={task.id}
                type="button"
                onClick={() => {
                  setActiveTaskId(task.id);
                  if (!answers[task.id]) {
                    setAnswers(prev => ({ ...prev, [task.id]: scenario.files[0]?.content || "" }));
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 text-sm min-w-max transition-colors ${
                  activeTaskId === task.id
                    ? "border-t-2 border-[#0047AB] bg-white font-semibold text-[#0047AB]"
                    : "font-medium text-gray-500 hover:bg-gray-100 border-t-2 border-transparent"
                }`}
              >
                <FileCode className={`h-4 w-4 ${activeTaskId === task.id ? "text-blue-500" : "text-gray-400"}`} />
                Task {idx + 1}
              </button>
            ))}
          </div>

          {/* Code Area */}
          <div className="flex-1 flex flex-col bg-[#0d1117] relative">
            <textarea
              value={answers[activeTaskId] || ""}
              onChange={(e) => setAnswers({ ...answers, [activeTaskId]: e.target.value })}
              placeholder={`// Write your optimized code or system design for Task ${tasks.findIndex(t => t.id === activeTaskId) + 1} here...\n// (Gõ lời giải của bạn vào đây)`}
              className="flex-1 w-full resize-none bg-transparent p-6 font-mono text-[14px] leading-relaxed text-[#c9d1d9] focus:outline-none placeholder:text-[#484f58]"
              spellCheck="false"
            />
          </div>

          {/* Bottom Panel (Terminal/Tests) */}
          <div className="h-[280px] shrink-0 border-t border-gray-200 flex flex-col bg-white">
            <div className="flex h-10 items-center justify-between border-b border-gray-200 px-2 bg-gray-50/50">
              <div className="flex gap-1 h-full pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("terminal")}
                  className={`flex items-center gap-2 px-4 py-1 text-sm font-medium ${activeTab === "terminal" ? "text-foreground border-b-2 border-foreground font-bold" : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"}`}
                >
                  <TerminalSquare className="h-4 w-4" /> Terminal
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tests")}
                  className={`flex items-center gap-2 px-4 py-1 text-sm font-medium ${activeTab === "tests" ? "text-foreground border-b-2 border-foreground font-bold" : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"}`}
                >
                  <CheckCircle2 className="h-4 w-4" /> Tests
                  {currentSimResult && (
                    <span className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] ${currentSimResult.output?.passed === currentSimResult.output?.total ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {currentSimResult.output?.passed}/{currentSimResult.output?.total}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("database")}
                  className={`flex items-center gap-2 px-4 py-1 text-sm font-medium ${activeTab === "database" ? "text-foreground border-b-2 border-foreground font-bold" : "text-blue-600 hover:text-blue-800 border-b-2 border-transparent"}`}
                >
                  <Database className="h-4 w-4" /> Database Schema
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRunCode}
                  disabled={isSimulating}
                  className="flex items-center gap-2 rounded bg-[#00875A] px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-green-700 disabled:opacity-70 disabled:cursor-wait"
                >
                  {isSimulating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  {isSimulating ? "Running..." : "Chạy code"}
                </button>
              </div>
            </div>

            <div className="flex-1 p-5 overflow-auto font-mono text-xs text-gray-800 bg-[#f6f8fa]">
              {activeTab === "terminal" && (
                <div className="space-y-1">
                  <div className="text-gray-500">$ {scenario.files[0]?.language === 'typescript' ? 'npx ts-node' : 'javac'} {scenario.files[0]?.path.split('/').pop() || `Task_${tasks.findIndex(t => t.id === activeTaskId) + 1}.java`}</div>
                  {isSimulating && <div className="text-yellow-600 animate-pulse">Compiling and running...</div>}
                  {!isSimulating && !currentSimResult && (
                    <div className="text-gray-400 italic">Nhấn &quot;Chạy code&quot; để xem kết quả biên dịch.</div>
                  )}
                  {!isSimulating && currentSimResult && currentSimResult.output?.logs.map((log, i) => (
                    <div key={i} className={log.includes("Error") || log.includes("failed") ? "text-red-600" : log.includes("success") || log.includes("passed") ? "text-green-600" : ""}>
                      {log}
                    </div>
                  ))}
                  {!isSimulating && currentSimResult && currentSimResult.output?.errors.map((err, i) => (
                    <div key={`err-${i}`} className="text-red-600 font-bold">{err}</div>
                  ))}
                </div>
              )}

              {activeTab === "tests" && (
                <div>
                  {!currentSimResult && !isSimulating && (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 pt-10">
                      <CheckCircle2 className="h-8 w-8 mb-2 opacity-20" />
                      <p>Chưa có kết quả test. Hãy chạy code để kiểm tra hiệu năng.</p>
                    </div>
                  )}

                  {isSimulating && (
                     <div className="flex flex-col items-center justify-center h-full text-gray-400 pt-10">
                     <Loader2 className="h-8 w-8 mb-2 animate-spin text-[#0047AB]" />
                     <p>Đang chạy các test case kiểm tra tải và hiệu năng...</p>
                   </div>
                  )}

                  {!isSimulating && currentSimResult && currentSimResult.output && (
                    <div>
                      <div className="mb-4 flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm">
                        <div className="flex items-start gap-3">
                          {currentSimResult.output.passed === currentSimResult.output.total ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                          )}
                          <div>
                            <h3 className={`font-bold text-sm ${currentSimResult.output.passed === currentSimResult.output.total ? 'text-green-700' : 'text-red-700'}`}>
                              {currentSimResult.output.passed === currentSimResult.output.total ? 'Chạy code thành công' : 'Chạy code thất bại'}
                            </h3>
                            <p className="text-xs text-gray-600 mt-1">
                              {currentSimResult.output.passed === currentSimResult.output.total
                                ? 'Code của bạn đã được tối ưu và vượt qua tất cả các test hiện có.'
                                : 'Code chưa đạt yêu cầu về hiệu năng hoặc logic. Vui lòng kiểm tra lỗi và tối ưu thêm.'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-2xl font-bold ${currentSimResult.output.passed === currentSimResult.output.total ? 'text-green-600' : 'text-red-600'}`}>
                            {currentSimResult.output.passed}/{currentSimResult.output.total}
                          </span>
                          <div className="text-[10px] text-gray-500">test đạt</div>
                        </div>
                      </div>

                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-gray-500 border-b border-gray-200">
                            <th className="font-medium pb-2">Test case</th>
                            <th className="font-medium pb-2 text-center">Kết quả</th>
                            <th className="font-medium pb-2 text-right">Thời gian (ms)</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {currentSimResult.output.logs.filter(l => l.includes("Test")).map((log, i) => {
                            const isPass = log.includes("passed");
                            const name = log.split(":")[0]?.replace(/[✓✗]/, '').trim();
                            const timeMatch = log.match(/\((\d+ms)\)/);
                            const time = timeMatch ? timeMatch[1] : (isPass ? "12ms" : "timeout");
                            return (
                              <tr key={i}>
                                <td className="py-3 font-mono">{name || `Test Case ${i+1}`}</td>
                                <td className="py-3 text-center">
                                  {isPass ? <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" /> : <XCircle className="h-4 w-4 text-red-600 mx-auto" />}
                                </td>
                                <td className={`py-3 text-right ${!isPass ? 'text-red-600' : ''}`}>{time}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "database" && (
                <div className="whitespace-pre-wrap text-[#0047AB] font-bold">
                  {scenario.databaseSchema || "// Không có Database Schema cho tình huống này."}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* Right Sidebar (Status) */}
        <aside className="w-[300px] shrink-0 border-l border-gray-200 bg-gray-50/50 p-5 overflow-y-auto flex flex-col gap-6">

          <section>
            <h3 className="mb-4 flex items-center justify-between text-sm font-bold text-foreground">
              Thông tin hệ thống <Info className="h-4 w-4 text-gray-400" />
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="flex items-center gap-2 text-text-muted"><Clock className="h-3.5 w-3.5" /> Chuyên môn</span>
                <span className="font-semibold text-foreground text-blue-600">{scenario.targetRole}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 pb-2">
                <span className="flex items-center gap-2 text-text-muted"><Folder className="h-3.5 w-3.5" /> Môi trường</span>
                <span className="font-semibold text-foreground">IDE Online</span>
              </div>
            </div>
          </section>

          <section>
            <h3 className="mb-4 flex items-center justify-between text-sm font-bold text-foreground">
              Tiêu chí Đánh giá <Info className="h-4 w-4 text-gray-400" />
            </h3>
            {activeTask && (
              <div className="space-y-4 text-xs">
                {Array.isArray(activeTask.rubric) && (activeTask.rubric as { label: string; maxScore: number }[]).map((r, idx) => (
                  <div key={idx} className="rounded border border-gray-200 bg-white p-3 shadow-sm">
                    <div className="font-bold text-foreground flex justify-between items-start mb-2">
                      <span>{r.label}</span>
                      <span className="text-[#0047AB] ml-2 shrink-0">{r.maxScore} đ</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="flex-1 flex flex-col">
            <h3 className="mb-4 text-sm font-bold text-foreground">Trạng thái hiện tại</h3>
            <div className="space-y-3 text-xs mb-6">
              {tasks.map((task, idx) => {
                const sim = simulationResults[task.id];
                return (
                  <div key={task.id} className="flex justify-between">
                    <span className="text-text-muted font-medium">Task {idx + 1}</span>
                    {sim ? (
                      sim.output?.passed === sim.output?.total ? (
                        <span className="flex items-center gap-1.5 font-bold text-green-600"><CheckCircle2 className="h-3.5 w-3.5" /> Passed</span>
                      ) : (
                        <span className="flex items-center gap-1.5 font-bold text-red-600"><XCircle className="h-3.5 w-3.5" /> Failed</span>
                      )
                    ) : (
                      <span className="flex items-center gap-1.5 font-medium text-gray-400">Empty</span>
                    )}
                  </div>
                );
              })}
            </div>

          </section>

        </aside>
      </div>

      {/* Submission Preview Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-[480px] rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowSubmitModal(false)} className="text-gray-400 hover:text-gray-700 disabled:opacity-50" disabled={pending}><X className="h-5 w-5" /></button>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#0047AB]">
                <Send className="h-8 w-8 ml-1" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-foreground">Xác nhận Nộp bài</h2>
              <p className="mt-2 text-sm text-text-muted px-4 leading-relaxed">
                Hệ thống AI sẽ phân tích và chấm điểm mã nguồn tối ưu của bạn dựa trên các tiêu chí rubric được giao.
              </p>
            </div>

            <div className="mt-8 space-y-3 rounded-xl border border-gray-200 p-4 text-sm font-medium">
              {tasks.map((task, idx) => {
                const rawLen = answers[task.id]?.length || 0;
                // Add 48 chars for the headers added in the action (## Giải pháp... + ## Kế hoạch...)
                const len = rawLen > 0 ? rawLen + 48 : 0;
                const isPass = len >= 120;
                return (
                  <div key={task.id} className="flex justify-between border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                    <span className="truncate pr-4">Task {idx + 1}</span>
                    <span className={`flex items-center gap-1.5 shrink-0 ${isPass ? 'text-green-600' : 'text-amber-600'}`}>
                      {isPass ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      {len} chars (Yêu cầu &ge; 120)
                    </span>
                  </div>
                );
              })}
            </div>

            {state.status === "error" && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 flex flex-col gap-2">
                <div className="flex gap-2 font-bold">
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{state.message}</span>
                </div>
                {state.fieldErrors && (
                  <ul className="list-disc pl-8 mt-1 text-xs space-y-1">
                    {Object.entries(state.fieldErrors).map(([field, errors]) => (
                      <li key={field}>
                        {Array.isArray(errors) ? errors.join(', ') : errors}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <p className="mt-6 flex items-center justify-center gap-2 text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
              <AlertTriangle className="h-4 w-4 shrink-0" /> Bạn không thể quay lại chỉnh sửa sau khi nộp.
            </p>

            <div className="mt-6 flex gap-4">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={pending}
                className="flex-1 rounded-xl border border-[#0047AB] px-4 py-3 text-sm font-bold text-[#0047AB] hover:bg-blue-50 transition-colors disabled:opacity-50"
              >
                Quay lại
              </button>
              <button
                type="submit"
                disabled={pending}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#00875A] px-4 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors disabled:opacity-70 disabled:cursor-wait"
              >
                {pending ? (
                  <>Đang chấm điểm...</>
                ) : (
                  <>Nộp chấm điểm</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-[560px] rounded-2xl bg-white p-10 shadow-2xl text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-foreground">Nộp bài thành công</h2>
            <p className="mt-2 text-sm font-medium text-text-muted">
              Cảm ơn bạn đã hoàn thành bài test tối ưu hóa. Báo cáo đánh giá đã được tạo!
            </p>

            <div className="mt-8 rounded-xl border border-gray-200 text-left text-sm font-medium overflow-hidden">
              <div className="flex justify-between border-b border-gray-200 bg-gray-50 px-5 py-4">
                <span className="text-text-muted">Bài test:</span>
                <span className="font-bold text-foreground">{roleTitle}</span>
              </div>
              <div className="flex justify-between border-b border-gray-200 px-5 py-4">
                <span className="text-text-muted">Số bài đã hoàn thành:</span>
                <span className="font-bold text-green-600">{tasks.length}/{tasks.length}</span>
              </div>
            </div>

            <div className="mt-10 flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="rounded-xl border border-gray-300 px-6 py-3 text-sm font-bold text-foreground hover:bg-gray-50 transition-colors"
              >
                Về trang chủ
              </Link>
              <button
                type="button"
                onClick={() => router.refresh()} // Refresh to reload page without ?status=TASKS_GENERATED constraint -> will show AssessmentReport
                className="flex items-center gap-2 rounded-xl bg-[#00875A] px-6 py-3 text-sm font-bold text-white hover:bg-green-700 transition-colors"
              >
                <FileText className="h-4 w-4" /> Xem Báo cáo Đánh giá
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-gray-900/40 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <div className="flex justify-end">
              <button type="button" onClick={() => setShowExitModal(false)} className="text-gray-400 hover:text-gray-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h2 className="mt-5 text-xl font-bold text-foreground">Bạn có chắc chắn muốn thoát?</h2>
              <p className="mt-2 text-sm text-text-muted px-4 leading-relaxed">
                Tất cả mã nguồn và tiến trình làm bài của bạn sẽ <strong>không được lưu lại</strong>. Phiên đánh giá này sẽ bị hủy bỏ.
              </p>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                type="button"
                onClick={() => setShowExitModal(false)}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm font-bold text-foreground hover:bg-gray-50 transition-colors"
              >
                Tiếp tục làm bài
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard')}
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 transition-colors"
              >
                Thoát ngay
              </button>
            </div>
          </div>
        </div>
      )}

    </form>
  );
}
