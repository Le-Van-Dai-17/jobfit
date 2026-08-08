## Current MVP Scope

CV_KADA hiện tập trung vào vòng lặp:

```text
CV -> realistic engineering tasks -> evidence-based assessment results for employers
```

Các luồng CV, jobs, matching, optimization, tracker và interview chỉ hỗ trợ vòng lặp này. Không mở rộng sản phẩm thành certification platform, social network hoặc LMS.

<div align="center">
  
  # ✨ CV_KADA
  ### The Next-Gen Career & Resume Platform
  
  CV_KADA là một nền tảng toàn diện hỗ trợ ứng viên từ bước tạo CV chuyên nghiệp đến khi nhận được Offer. Được xây dựng dựa trên kiến trúc **Modular Monolith** với công nghệ AI tiên tiến, giúp tự động hóa quá trình tối ưu hồ sơ và phỏng vấn.

  ![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)
  ![React](https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react)
  ![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178C6?style=for-the-badge&logo=typescript)
  ![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)
  ![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)
  ![Gemini](https://img.shields.io/badge/Google_Gemini-AI-4285F4?style=for-the-badge&logo=google)
  
</div>

---

## 👥 Nhóm Phát triển (Team Members)

Dự án được phát triển bởi các thành viên:

| STT | Họ và Tên | MSSV | Vai trò trong dự án |
| :---: | :--- | :--- | :--- |
| 1 | **Lê Văn Đại** | N23DCCN144 | **Team Leader & Fullstack Developer:** Thiết kế kiến trúc tổng thể, tích hợp Auth.js và phát triển tính năng AI. |
| 2 | **Phạm Văn Đoàn** | N23DCCN010 | **Frontend Developer:** Xây dựng giao diện UI/UX, phát triển tính năng CV Builder và Application Tracker. |
| 3 | **Trần Trường Thuận** | N23DCCN060 | **Backend Developer:** Thiết kế Database Schema (Prisma, Supabase), xây dựng các API và Server Actions cốt lõi. |
| 4 | **Phan Giảng Bình** | N24DECE056 | **AI & Data Engineer:** Tối ưu hóa Prompts cho Gemini AI, phát triển tính năng Mock Interview và Job Matching. |

---

## 🎯 Khách hàng mục tiêu & Nỗi đau (Persona & Pain Points)

**Chân dung người dùng (Persona):**
- Sinh viên Công nghệ thông tin mới ra trường (Fresher) hoặc Lập trình viên có 1-3 năm kinh nghiệm (Junior/Mid-level).
- **Mục tiêu:** Cần một CV chuẩn ATS, thể hiện rõ kỹ năng chuyên môn, kinh nghiệm dự án và muốn tìm được công việc phù hợp với mức lương kỳ vọng.

**Nỗi đau (Pain Points):**
- ❌ Dùng các mẫu thiết kế (Canva/Word) sặc sỡ nhưng **không thân thiện với hệ thống quét CV tự động (ATS)**.
- ❌ Không biết cách viết mô tả kinh nghiệm (Experience) sao cho thu hút, thường viết lan man, **thiếu keyword** quan trọng theo yêu cầu của Job Description (JD).
- ❌ Rải CV nhiều nơi nhưng **tỷ lệ phản hồi thấp** (rớt từ vòng hồ sơ) do CV không "khớp" với JD.
- ❌ Quản lý trạng thái ứng tuyển lộn xộn trên Excel/Ghi chú, thường xuyên quên lịch hoặc nhầm lẫn giữa các công ty.
- ❌ Thiếu tự tin, không biết nhà tuyển dụng sẽ hỏi gì trong buổi phỏng vấn dựa trên CV và JD cụ thể.

## 💡 Giải pháp từ CV_KADA (Solutions)
- ✅ Trình tạo CV giao diện trực quan, cấu trúc xuất chuẩn ATS dành riêng cho kỹ sư công nghệ.
- ✅ Tích hợp AI phân tích điểm Match Score giữa CV và JD, gợi ý bổ sung keyword bị thiếu.
- ✅ AI hỗ trợ viết lại mô tả kinh nghiệm chuyên nghiệp (theo format STAR).
- ✅ Kanban board giúp theo dõi phễu ứng tuyển trực quan (Applied -> Interview -> Offer -> Reject).
- ✅ Phỏng vấn giả lập (Mock Interview) với AI: AI đóng vai nhà tuyển dụng đặt câu hỏi và chấm điểm câu trả lời của bạn.

---

## 🚀 Tính năng cốt lõi (Core Features)

- 📄 **Trình tạo CV Tương tác (Realtime CV Builder)**
  - Giao diện Split-pane: Sửa bên trái, Live Preview bên phải.
  - Tự động lưu (Auto-save) mượt mà với Zustand và Prisma.
- 🎯 **Phân tích độ phù hợp (Job Match Analysis)**
  - Chấm điểm CV của bạn so với Job Description (JD).
  - Khám phá từ khóa (keywords) bị thiếu để vượt qua hệ thống ATS.
- ✨ **Tối ưu CV bằng AI (CV Optimization)**
  - Tự động viết lại phần Tóm tắt (Summary) và Kinh nghiệm làm việc để đánh trúng tâm lý nhà tuyển dụng.
- 📊 **Theo dõi ứng tuyển (Application Tracker)**
  - Kanban board (Kéo/thả trạng thái: Đã nộp, Phỏng vấn, Có Offer, Từ chối).
- 🎤 **Phỏng vấn giả lập AI (Mock Interview)**
  - AI đóng vai Recruiter, đọc JD và đưa ra 3 câu hỏi (Hành vi, Kỹ năng, Tình huống).
  - Chấm điểm câu trả lời và đưa ra nhận xét tức thì.

---

## 🛠 Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TailwindCSS, Zustand, Lucide Icons.
- **Backend:** Server Components, Route Handlers, Server Actions.
- **Database:** PostgreSQL (hosted trên Supabase), Prisma ORM.
- **Authentication:** Auth.js v5 (Google OAuth, GitHub OAuth, Credentials).
- **AI Engine:** Google Gemini 2.5 Flash SDK (Structured Outputs & JSON Schema).

---

## ⚙️ Hướng dẫn Cài đặt & Chạy Local

### Yêu cầu hệ thống:
- **Node.js** >= 20.x
- **PostgreSQL** (hoặc tạo tài khoản Supabase miễn phí)
- **Google Gemini API Key** (lấy miễn phí tại [Google AI Studio](https://aistudio.google.com/))

### Các bước cài đặt:

**1. Clone kho lưu trữ:**
```bash
git clone https://github.com/doanduahau/CV-KaDa.git
cd CV-KaDa/cv-app
```

**2. Cài đặt thư viện:**
```bash
npm install
```

**3. Thiết lập biến môi trường:**
Tạo file `.env` ở thư mục `cv-app` và điền các thông tin sau:
```env
# URL kết nối Database của Supabase/PostgreSQL
DATABASE_URL="postgresql://postgres:[PASSWORD]@your-db-host:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@your-db-host:5432/postgres"

# Google Gemini API Key
GEMINI_API_KEY="your-gemini-api-key"

# Mật khẩu bảo mật cho Session Auth (Tự tạo bằng chuỗi ngẫu nhiên 32 ký tự)
AUTH_SECRET="your-random-auth-secret-here"

# (Optional) Nếu muốn dùng Google/GitHub Login
AUTH_GOOGLE_ID=""
AUTH_GOOGLE_SECRET=""
AUTH_GITHUB_ID=""
AUTH_GITHUB_SECRET=""
```

**4. Khởi tạo Database:**
```bash
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
```

Không dùng `prisma db push` cho database có dữ liệu thật. Với database trống, `migrate deploy` chạy toàn bộ migration history. Với database đã từng tạo bằng `db push`, hãy backup, so sánh schema với baseline, chỉ `migrate resolve --applied` cho baseline sau khi xác nhận schema tương đương, rồi mới chạy `migrate deploy`.

**5. Chạy môi trường Development:**
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: **http://localhost:3000**

---

## 🔒 Đăng nhập môi trường Dev/Demo

Đăng nhập credentials dùng tài khoản đã đăng ký trong database. Fallback demo chỉ hoạt động ngoài production khi bật rõ trong `.env`:

```env
AUTH_ENABLE_DEV_DEMO_LOGIN="true"
AUTH_DEV_DEMO_EMAIL="demo@cvkada.local"
AUTH_DEV_DEMO_PASSWORD="your-local-demo-password"
```

Fallback này chỉ chấp nhận đúng email/mật khẩu đã cấu hình, không phải bất kỳ email với `123456`.

---

## 🏗 Kiến trúc (Architecture)

Ứng dụng tuân thủ nghiêm ngặt mô hình **Modular Monolith** và nguyên tắc thiết kế **Solid**:
- Không gọi Database trực tiếp từ Presentation Components (UI).
- Mọi logic giao tiếp Database đi qua `Repositories` và `Services`.
- Validation nghiêm ngặt toàn bộ input đầu vào và AI outputs bằng `Zod`.
- Tách biệt `AIProvider` adapter để dễ dàng thay đổi nhà cung cấp AI trong tương lai (OpenAI, Anthropic) mà không ảnh hưởng Domain Logic.

*Tham khảo các tài liệu chi tiết tại thư mục `docs/adr/`.*

---

<div align="center">
  <i>Được thiết kế và xây dựng dành riêng cho những ứng viên muốn nổi bật giữa đám đông.</i>
</div>
