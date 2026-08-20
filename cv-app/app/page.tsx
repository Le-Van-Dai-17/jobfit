import { ArrowRight, BrainCircuit, CheckCircle2, ChevronRight, FileText, Search, Trophy } from "lucide-react";
import Link from "next/link";


import { auth } from "@/auth";

export default async function LandingPage() {
  const session = await auth();

  return (
    <div className="bg-[#F8FAFC] -m-6 pb-20 font-sans">

      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#E8F0FE] to-[#DCE3FE] px-4 py-20 md:px-10 md:py-32 rounded-b-[40px] md:rounded-b-[80px]">
        {/* Abstract shapes */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 h-96 w-96 rounded-full bg-gradient-to-tr from-[#0047AB]/10 to-blue-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 h-[500px] w-[500px] rounded-full bg-gradient-to-br from-indigo-200/40 to-blue-200/20 blur-3xl" />

        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-white/60 px-4 py-1.5 backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
            <span className="text-sm font-bold text-[#0047AB]">Tuyển dụng minh bạch bằng thực lực</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:text-7xl">
            Vượt Qua Vòng Hồ Sơ, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0047AB] to-indigo-600">
              Nhận Việc Bằng Kỹ Năng Thật
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 md:text-xl">
            Nền tảng tuyển dụng IT tiên phong kết hợp <strong className="text-slate-800">So khớp CV bằng AI</strong> và <strong className="text-slate-800">Đánh giá Năng lực Thực tế</strong>. Đừng để CV đẹp che lấp tài năng thực sự của bạn.
          </p>

          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            {session ? (
              <Link href="/dashboard" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0047AB] px-8 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 hover:bg-blue-800">
                Vào Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link href="/register" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0047AB] px-8 text-base font-bold text-white shadow-lg shadow-blue-500/30 transition-transform hover:scale-105 hover:bg-blue-800">
                  Tạo CV & Ứng tuyển ngay <ArrowRight className="h-5 w-5" />
                </Link>
                <Link href="/jobs" className="inline-flex h-14 items-center justify-center gap-2 rounded-full bg-white px-8 text-base font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition-colors hover:bg-slate-50 hover:text-[#0047AB]">
                  Xem việc làm <Search className="h-5 w-5" />
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS (Luật chơi) */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-slate-900 md:text-4xl">Luật Chơi Rất Đơn Giản</h2>
          <p className="mt-4 text-lg text-slate-600">Quy trình 3 bước đảm bảo bạn được đánh giá công bằng tuyệt đối bởi Nhà tuyển dụng.</p>
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-3">

          {/* Step 1 */}
          <div className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
            <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0047AB] to-blue-400 text-xl font-bold text-white shadow-lg">
              1
            </div>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0047AB]">
              <FileText className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">Chuẩn Bị CV Hoàn Hảo</h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Sử dụng CV Builder để tạo hồ sơ. Trí tuệ nhân tạo Gemini sẽ tự động soi chiếu CV của bạn với Yêu cầu công việc (JD) để tối ưu điểm chạm.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
            <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0047AB] to-blue-400 text-xl font-bold text-white shadow-lg">
              2
            </div>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0047AB]">
              <BrainCircuit className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">Nhà Tuyển Dụng Xem Xét</h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Sau khi bấm &quot;Ứng tuyển&quot;, CV của bạn được gửi tới recruiter để xem xét mức độ phù hợp với JD, kinh nghiệm và kỹ năng.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative rounded-3xl border border-slate-100 bg-white p-8 shadow-sm transition-shadow hover:shadow-xl">
            <div className="absolute -top-6 left-8 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0047AB] to-blue-400 text-xl font-bold text-white shadow-lg">
              3
            </div>
            <div className="mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-[#0047AB]">
              <Trophy className="h-7 w-7" />
            </div>
            <h3 className="mt-6 text-xl font-bold text-slate-900">Được Mời Vào Vòng Sau</h3>
            <p className="mt-3 leading-relaxed text-slate-600">
              Nếu phù hợp, công ty sẽ chủ động mời bạn phỏng vấn hoặc làm bài đánh giá trực tiếp để kết quả khách quan hơn.
            </p>
          </div>

        </div>
      </section>

      {/* 3. KEY FEATURES (Tính năng nổi bật) */}
      <section className="bg-slate-900 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-2">

            <div className="order-2 lg:order-1">
              {/* Mockup Window */}
              <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-800 shadow-2xl">
                <div className="flex items-center gap-2 border-b border-slate-700 bg-slate-900/50 px-4 py-3">
                  <div className="h-3 w-3 rounded-full bg-red-500" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500" />
                  <div className="h-3 w-3 rounded-full bg-green-500" />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                    <div>
                      <h4 className="font-bold text-white">Báo Cáo Năng Lực Ứng Viên</h4>
                      <p className="text-sm text-slate-400">Match Score: 85% - Rất phù hợp</p>
                    </div>
                    <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-bold text-green-400">Sẵn sàng phỏng vấn</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    <div className="h-4 w-3/4 rounded bg-slate-700" />
                    <div className="h-4 w-full rounded bg-slate-700" />
                    <div className="h-4 w-5/6 rounded bg-slate-700" />
                  </div>
                  <div className="mt-6 flex gap-3">
                    <div className="h-8 w-20 rounded-lg bg-blue-600" />
                    <div className="h-8 w-24 rounded-lg bg-slate-700" />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-extrabold md:text-4xl">Tại sao doanh nghiệp thích ứng viên từ CV_KADA?</h2>
              <p className="mt-6 text-lg leading-relaxed text-slate-400">
                Các nhà tuyển dụng (Recruiters) luôn khao khát tìm được ứng viên &quot;thật&quot;. CV_KADA cung cấp cho họ một hệ thống đánh giá khách quan:
              </p>

              <ul className="mt-8 space-y-5">
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h4 className="font-bold text-white">Bằng Chứng Bê Tông (Hard Evidence)</h4>
                    <p className="mt-1 text-sm text-slate-400">Nhà tuyển dụng không chỉ xem CV mà xem cách bạn giải quyết vấn đề kỹ thuật.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h4 className="font-bold text-white">Bảng Xếp Hạng Công Bằng (Leaderboard)</h4>
                    <p className="mt-1 text-sm text-slate-400">Hệ thống AI tự động phân loại những ứng viên xuất sắc nhất lên đầu danh sách.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <CheckCircle2 className="mt-1 h-6 w-6 shrink-0 text-blue-500" />
                  <div>
                    <h4 className="font-bold text-white">Tối Ưu Hóa Phỏng Vấn (Mock Interview)</h4>
                    <p className="mt-1 text-sm text-slate-400">Hệ thống tạo ra các câu hỏi phỏng vấn mô phỏng đúng trình độ của bạn để HR dễ dàng phỏng vấn.</p>
                  </div>
                </li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 4. CTA */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-extrabold text-slate-900">Sẵn sàng chứng tỏ bản thân?</h2>
        <p className="mt-4 text-lg text-slate-600">Đăng ký tài khoản miễn phí và nộp CV vào công ty mơ ước của bạn ngay hôm nay.</p>
        <Link href="/register" className="mt-8 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#0047AB] px-10 text-lg font-bold text-white shadow-xl shadow-blue-500/30 transition-transform hover:scale-105 hover:bg-blue-800">
          Bắt đầu miễn phí <ChevronRight className="h-5 w-5" />
        </Link>
      </section>

    </div>
  );
}
