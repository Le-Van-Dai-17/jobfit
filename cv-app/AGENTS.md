<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:product-rules -->
## Product Rules

- **Mục tiêu sản phẩm:** Jobfit là MVP tuyển dụng xoay quanh vòng lặp `CV -> realistic engineering tasks -> evidence-based assessment results for employers`; CV, jobs, matching, optimization, tracker, and interview modules support that loop.
- **Đối tượng người dùng:** Người tìm việc (Việt Nam), kỹ sư công nghệ.
- **Luồng chính:** Tạo/Quản lý CV → Tối ưu theo JD → Phân tích match → Ứng tuyển → Theo dõi → Phỏng vấn thử.
- **Dữ liệu:** Prisma/PostgreSQL, Auth.js, repositories/services, and API routes exist. Some UI surfaces still use mock/demo state; document that status instead of reverting to UI-only assumptions.
- **AI Features:** ATS scoring, keyword extraction, job match %, rephrase suggestion, and interview features use Gemini-backed routes when credentials are present. CI/tests must keep mock/local paths and avoid live provider calls.
<!-- END:product-rules -->

<!-- BEGIN:architecture-rules -->
## Architecture Rules

- **Framework:** Next.js 16.2.12 App Router.
- **Routing:** Server Components mặc định trong `app/` directory. Chỉ dùng `"use client"` ở component thực sự cần state, event handler hoặc browser API.
- **Components:** Component dùng chung đặt trong `components/`, phân loại theo domain (layout/, dashboard/).
- **State management:** Dùng React `useState` hiện tại. Khi mở rộng, ưu tiên React Context hoặc Zustand.
- **API layer:** Route handlers and server actions exist. Preserve `UI -> action/controller -> service -> repository/provider`.
- **Design tokens:** Định nghĩa trong `DESIGN.md`. Theme CSS variables trong `app/globals.css`. Không hardcode giá trị thiết kế.
- **Package manager:** Chỉ dùng **npm**. Không tạo pnpm-lock.yaml, yarn.lock.
- **Ngôn ngữ UI:** Tiếng Việt (vi).
<!-- END:architecture-rules -->

<!-- BEGIN:ui-rules -->
## UI Rules

- **Layout:** Sidebar (w-64) trái + Header cố định trên + `<main>` fill còn lại.
- **Responsive:** Thiết kế mobile-first. Sidebar ẩn trên mobile, dùng drawer.
- **Design System:** Tuân thủ DESIGN.md: màu sắc (Indigo #4648d4, Violet #6b38d4, Sky #00628d), typography (Inter), spacing (4px grid), border radius.
- **Animation:** Dùng Framer Motion cho micro-interactions (gauge, card hover, page transition).
- **Icons:** Dùng Lucide React.
- **Accessibility:** Tất cả interactive elements phải có focus visible, keyboard navigable, aria-labels.
<!-- END:ui-rules -->

<!-- BEGIN:a11y-rules -->
## Accessibility Rules

- **Semantic HTML:** Dùng `<nav>`, `<main>`, `<header>`, `<section>`, `<button>` đúng ngữ nghĩa.
- **Keyboard navigation:** Tất cả nút, link, input phải focusable và operable bằng bàn phím.
- **Focus indicators:** Luôn hiển thị focus ring (outline) cho interactive elements.
- **ARIA labels:** Icon buttons, progress indicators, và các element không có text label phải có `aria-label`.
- **Color contrast:** Tuân thủ WCAG 2.1 AA — text trên nền màu phải đủ tương phản.
- **Form labels:** Mọi input phải có `<label>` hoặc `aria-label` liên kết.
- **Ngôn ngữ:** `<html lang="vi">` đã được thiết lập trong layout.
<!-- END:a11y-rules -->

<!-- BEGIN:testing-requirements -->
## Testing Requirements

- **TypeScript:** `tsc --noEmit` phải pass (strict mode).
- **Lint:** `npm run lint` không có lỗi.
- **Build:** `npm run build` phải thành công.
- **Pre-commit:** Chạy `npm run check` (lint + typecheck + build) trước mỗi commit.
- **Testing framework:** Vitest is configured. Add focused unit tests for changed deterministic schema/service logic.
<!-- END:testing-requirements -->

<!-- BEGIN:commands -->
## Commands

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run start    # Start production server
npm run lint     # ESLint
npm run typecheck # TypeScript check (tsc --noEmit)
npm run check    # Lint + typecheck + unit tests + build
```
<!-- END:commands -->

<!-- BEGIN:sources-of-truth -->
## Sources of Truth

1. **`DESIGN.md`** — Design tokens, colors, typography, spacing, border radius
2. **`package.json`** — Dependencies, scripts, engines
3. **`tsconfig.json`** — TypeScript configuration (strict mode)
4. **`eslint.config.mjs`** — ESLint rules
5. **`node_modules/next/dist/docs/`** — Next.js 16 API reference (luôn đọc trước khi code)
6. **`docs/PRD.md`** — Product requirements
7. **`docs/ROUTES.md`** — Route map và data relationships
8. **`README.md`** — Tổng quan dự án, setup
9. **`AGENTS.md`** — Rules file này (tất cả agent phải đọc)
<!-- END:sources-of-truth -->
