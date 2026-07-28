# Routes — Lumina AI

## Danh sách routes

| Route | File | Mô tả |
|-------|------|-------|
| `/` | `app/page.tsx` | Dashboard tổng quan |
| `/my-cv` | `app/my-cv/page.tsx` | Quản lý và chỉnh sửa CV |
| `/job-optimization` | `app/job-optimization/page.tsx` | Tối ưu CV theo mô tả công việc |
| `/job-match` | `app/job-match/page.tsx` | Phân tích mức độ phù hợp CV vs JD |
| `/jobs` | `app/jobs/page.tsx` | Tìm kiếm việc làm |
| `/interview` | `app/interview/page.tsx` | Phỏng vấn mô phỏng AI |
| `/tracker` | `app/tracker/page.tsx` | Theo dõi quy trình ứng tuyển |
| `/profile` | `app/profile/page.tsx` | Hồ sơ nghề nghiệp cá nhân |

## Chi tiết từng route

### Dashboard (`/`)

**Mục đích:** Cung cấp tổng quan nhanh về toàn bộ hệ thống.

**Dữ liệu sử dụng:**
- ATS score: từ CV hiện tại
- Job stats: tổng số jobs đã apply, interview rate, response rate
- Danh sách jobs đề xuất: từ dữ liệu jobs
- Activity timeline: từ tracker

### Quản lý CV (`/my-cv`)

**Mục đích:** Cho phép người dùng tạo và chỉnh sửa CV với preview trực tiếp.

**Dữ liệu sử dụng:**
- CV data: personal info, experience entries, skills
- Tất cả đều là mock data hiện tại

**Quan hệ:** CV data là đầu vào cho job-optimization, job-match, và profile.

### Tối ưu CV theo Job (`/job-optimization`)

**Mục đích:** Phân tích CV hiện tại so với mô tả công việc và đề xuất cải thiện.

**Dữ liệu sử dụng:**
- CV data (từ my-cv)
- JD text (người dùng paste vào)
- ATS score, missing/matched keywords (AI-generated)

### Phân tích Job Match (`/job-match`)

**Mục đích:** Đánh giá mức độ phù hợp giữa CV và một công việc cụ thể.

**Dữ liệu sử dụng:**
- CV data (từ my-cv)
- JD data (từ jobs)
- Match % breakdown (AI-generated)

### Tìm việc làm (`/jobs`)

**Mục đích:** Duyệt và tìm kiếm việc làm với điểm phù hợp AI.

**Dữ liệu sử dụng:**
- Job listings (mock data)
- AI match score (từ job-match logic)

**Quan hệ:** Jobs data được dùng bởi Dashboard (recommended), tracker (applied jobs).

### Phỏng vấn AI (`/interview`)

**Mục đích:** Mô phỏng phỏng vấn với AI, cung cấp phản hồi real-time.

**Dữ liệu sử dụng:**
- CV data (để tạo câu hỏi phù hợp)
- Câu hỏi phỏng vấn (mock)
- Feedback metrics (accuracy, clarity)

### Theo dõi ứng tuyển (`/tracker`)

**Mục đích:** Quản lý quy trình ứng tuyển dạng Kanban.

**Dữ liệu sử dụng:**
- Applications data (mock), mỗi application liên kết với một job từ jobs
- 4 trạng thái: Applied → Interview → Offer → Rejected

**Quan hệ:** Liên kết với jobs data (jobId), cập nhật dashboard stats.

### Hồ sơ nghề nghiệp (`/profile`)

**Mục đích:** Hiển thị thông tin cá nhân, kỹ năng, chứng chỉ.

**Dữ liệu sử dụng:**
- User profile data
- Skills (từ CV data)
- Certificates (mock)

## Sơ đồ quan hệ dữ liệu

```
CV Data (my-cv)
  ├── → job-optimization (phân tích CV vs JD)
  ├── → job-match (so khớp với jobs)
  ├── → interview (tạo câu hỏi)
  └── → profile (kỹ năng)

Jobs Data
  ├── → dashboard (recommended jobs)
  ├── → job-match (so khớp với CV)
  └── → tracker (applications)

Tracker Data
  └── → dashboard (activity timeline, stats)
```