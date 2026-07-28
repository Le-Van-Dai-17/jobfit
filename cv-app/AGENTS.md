<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:product-rules -->
## Product Rules

- **Mục tiêu sản phẩm:** Lumina AI là nền tảng giúp người dùng quản lý CV, tối ưu hồ sơ theo JD, phân tích job match, và theo dõi ứng tuyển.
- **Đối tượng người dùng:** Người tìm việc (Việt Nam), kỹ sư công nghệ.
- **Luồng chính:** Tạo/Quản lý CV → Tối ưu theo JD → Phân tích match → Ứng tuyển → Theo dõi → Phỏng vấn thử.
- **Dữ liệu:** Hiện tại dùng mock data. Khi có backend, dữ liệu CV và jobs phải đồng bộ.
- **AI Features:** ATS scoring, keyword extraction, job match %, rephrase suggestion — tất cả đều là AI-powered.
<!-- END:product-rules -->

<!-- BEGIN:architecture-rules -->
## Architecture Rules

- **Framework:** Next.js 16.2.12 App Router.
- **Routing:** Tất cả route đều là `"use client"` SPA pages trong `app/` directory.
- **Components:** Component dùng chung đặt trong `components/`, phân loại theo domain (layout/, dashboard/).
- **State management:** Dùng React `useState` hiện tại. Khi mở rộng, ưu tiên React Context hoặc Zustand.
- **API layer:** Chưa có — khi thêm, tạo `lib/api/` và gọi từ server actions hoặc client components.
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
- **Testing framework:** Chưa có — khi thêm, dùng Vitest + React Testing Library.
<!-- END:testing-requirements -->

<!-- BEGIN:commands -->
## Commands

```bash
npm run dev      # Chạy dev server
npm run build    # Build production
npm run start    # Start production server
npm run lint     # ESLint
npm run typecheck # TypeScript check (tsc --noEmit)
npm run check    # Lint + typecheck + build
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