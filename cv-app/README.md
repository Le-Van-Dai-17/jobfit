# Lumina AI - Nền tảng Quản lý CV & Tối ưu Nghề nghiệp Thông minh

Lumina AI là nền tảng hỗ trợ người tìm việc quản lý CV, tối ưu hồ sơ theo yêu cầu công việc, phân tích mức độ phù hợp, và theo dõi quá trình ứng tuyển — tất cả được hỗ trợ bởi AI.

## Tình trạng hiện tại

**Prototype giao diện (UI-only).** Toàn bộ ứng dụng hiện đang ở giai đoạn prototype với dữ liệu mẫu (mock data) được nhúng trong các client component. Chưa có kết nối backend, API, hay xác thực người dùng.

## Công nghệ sử dụng

| Công nghệ | Phiên bản |
|-----------|-----------|
| Next.js | 16.2.12 |
| React | 19.2.4 |
| TypeScript | ^5 |
| Tailwind CSS | ^4 |
| Framer Motion | ^12.42.2 |
| Lucide React | ^1.27.0 |
| ESLint | ^9 |

## Cài đặt và chạy

```bash
# Di chuyển vào thư mục dự án
cd cv-app

# Cài đặt dependencies (chỉ dùng npm)
npm install

# Chạy môi trường phát triển
npm run dev

# Kiểm tra toàn bộ (lint + typecheck + build)
npm run check
```

Mở [http://localhost:3000](http://localhost:3000) để xem kết quả.

## Các route hiện có

| Route | Trang | Mô tả |
|-------|-------|-------|
| `/` | Dashboard | Tổng quan, thống kê, chỉ số ATS, việc làm đề xuất |
| `/my-cv` | Quản lý CV | Soạn thảo CV với form + xem trước |
| `/job-optimization` | Tối ưu CV | Phân tích CV theo mô tả công việc, đề xuất từ khóa |
| `/job-match` | Phân tích Job Match | Đánh giá mức độ phù hợp CV với JD |
| `/jobs` | Tìm việc làm | Tìm kiếm việc làm với điểm phù hợp AI |
| `/interview` | Phỏng vấn AI | Mô phỏng phỏng vấn với phản hồi thời gian thực |
| `/tracker` | Theo dõi ứng tuyển | Kanban theo dõi quy trình ứng tuyển |
| `/profile` | Hồ sơ nghề nghiệp | Kỹ năng, chứng chỉ, thông tin cá nhân |

## Quy ước dự án

- **Client Components:** Tất cả page đều là `"use client"` do sử dụng state và event handlers.
- **Kiến trúc thư mục:** `app/` chứa routes, `components/` chứa các component dùng chung (layout, dashboard).
- **Thiết kế:** Design tokens được định nghĩa trong `DESIGN.md` (màu sắc, typography, spacing, border radius).
- **Package manager:** Chỉ dùng **npm**. Không tạo `pnpm-lock.yaml` hoặc `yarn.lock`.
- **AI Agents:** Khi code, đọc tài liệu Next.js trong `node_modules/next/dist/docs/` trước.