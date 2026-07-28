# Product Requirements Document — Lumina AI

## Tổng quan sản phẩm

Lumina AI là nền tảng web giúp người tìm việc (kỹ sư công nghệ tại Việt Nam) quản lý CV, tối ưu hồ sơ theo mô tả công việc, phân tích mức độ phù hợp, theo dõi ứng tuyển, và luyện phỏng vấn với AI.

## Mục tiêu

- Cung cấp công cụ tạo và quản lý CV trực quan.
- Sử dụng AI để phân tích CV, đề xuất tối ưu từ khóa theo JD.
- Đánh giá mức độ phù hợp (match %) giữa CV và công việc.
- Hỗ trợ theo dõi quy trình ứng tuyển dạng Kanban.
- Mô phỏng phỏng vấn AI với phản hồi thời gian thực.

## Các trang sản phẩm

### 1. Dashboard (`/`)
Trang tổng quan với hero banner, thống kê AI (ATS score 88%, jobs, applications, interview score, response rate), danh sách việc làm đề xuất, và timeline hoạt động.

### 2. Quản lý CV (`/my-cv`)
Trang soạn thảo CV với 3 tab: Personal Info, Experience, Skills. Form nhập liệu kết hợp với preview CV dạng resume sheet bên cạnh.

### 3. Tối ưu CV theo Job (`/job-optimization`)
Cho phép paste mô tả công việc (JD). AI phân tích và hiển thị:
- ATS score prediction hiện tại (96/100) và mức cải thiện (+14%).
- Missing keywords cần thêm.
- Matched keywords đã có.
- Gợi ý viết lại bullet points (AI rephrase).

### 4. Phân tích Job Match (`/job-match`)
So sánh CV với JD, hiển thị overall match (92.5%) và breakdown theo:
- Hard Skills match (95%)
- Experience match (90%)
- Education match (88%)
Kèm phân tích strengths và competitive advantages.

### 5. Tìm việc làm phù hợp (`/jobs`)
Trang tìm kiếm việc làm với ô tìm kiếm, bộ lọc, danh sách kết quả kèm AI match score, bookmark và apply.

### 6. Phỏng vấn mô phỏng AI (`/interview`)
Giao diện phỏng vấn với AI avatar/video, microphone recording, phản hồi real-time với accuracy và clarity progress bars, điều hướng câu hỏi.

### 7. Theo dõi ứng tuyển (`/tracker`)
Kanban board với 4 cột: Applied → Interview → Offer → Rejected. Thẻ ứng tuyển có thể di chuyển giữa các cột.

### 8. Hồ sơ nghề nghiệp (`/profile`)
Trang hồ sơ cá nhân với avatar, verified badge, skill matrix (progress bars), và certificates.

## Trạng thái hiện tại

**Prototype UI với mock data.** Toàn bộ dữ liệu đang được hardcode trong các client component. Chưa có backend, API, authentication, database.

## Công nghệ

| Công nghệ | Mục đích |
|-----------|----------|
| Next.js 16 | Framework, routing |
| React 19 | UI components |
| TypeScript 5 | Ngôn ngữ |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animation |
| Lucide React | Icons |
| ESLint 9 | Code quality |