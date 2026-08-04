# PLAN.md — Lumina AI MVP Production Roadmap

## Tổng quan

Roadmap này đưa **Lumina AI** từ prototype UI thành một **MVP production-ready** theo hướng **modular monolith trong Next.js**.

Nguyên tắc triển khai:

1. Hoàn thiện kiến trúc, dữ liệu, bảo mật và persistence trước.
2. Chỉ triển khai AI sau khi authentication, CV persistence và job persistence đã ổn định.
3. Mọi tính năng phải có test, acceptance criteria và exit gate rõ ràng.
4. Domain logic không được phụ thuộc trực tiếp vào hosting, UI framework hoặc AI provider cụ thể.

**Ước lượng tổng thể cho một lập trình viên:** khoảng **55–80 ngày công**, chưa tính thời gian chờ duyệt sản phẩm hoặc tích hợp nguồn việc làm bên ngoài.

---

# 1. Kiến trúc đích đề xuất

## 1.1. Technology stack

- **Next.js App Router** cho cả frontend và backend.
- **Server Components mặc định**.
- Chỉ sử dụng **Client Components** cho phần thực sự cần state, event handler hoặc browser API.
- **PostgreSQL** làm nguồn dữ liệu chính.
- **Prisma ORM stable**, không dùng Prisma Next Early Access.
- **Auth.js** cho Google OAuth hoặc magic link.
- Có thể thay Auth.js bằng managed auth nếu quyết định ở Phase 0 yêu cầu.
- **S3-compatible storage** cho:
  - CV.
  - Chứng chỉ.
  - Avatar.
  - Audio phỏng vấn.
- **Server Actions** cho mutation từ UI.
- **Route Handlers** cho:
  - Upload.
  - Webhook.
  - Public API.
  - Signed URL.
- **Vitest + React Testing Library** cho unit/component test.
- **Playwright** cho E2E trên:
  - Chromium.
  - Firefox.
  - WebKit.
- AI phải nằm sau `AIProvider` adapter.
- Không gọi AI SDK trực tiếp từ component.
- Triển khai ban đầu trên:
  - Vercel; hoặc
  - Node.js container.
- Domain logic không phụ thuộc hosting.

## 1.2. Cấu trúc thư mục gợi ý

```text
app/
  (auth)/
  (platform)/
  api/

components/
  ui/
  layout/

features/
  resumes/
  jobs/
  applications/
  matching/
  optimization/
  interviews/
  profile/

lib/
  auth/
  db/
  ai/
  storage/
  validation/
  observability/

prisma/

tests/
  unit/
  integration/
  e2e/
  evals/
```

## 1.3. Luồng kiến trúc bắt buộc

```text
UI
  ↓
Action / Controller
  ↓
Domain Service
  ↓
Repository
  ↓
Database / External Provider
```

Presentation component không được truy cập database trực tiếp.

---

# 2. Rule áp dụng cho mọi phase

## 2.1. Rule kiến trúc

- Đọc đầy đủ các tài liệu sau trước khi sửa:
  - `AGENTS.md`
  - `MASTER_PROMPT.md`
  - `DESIGN.md`
  - `PRD`
  - Route map
- Đọc tài liệu tương ứng trong `node_modules/next/dist/docs/` trước khi dùng Next.js API.
- Server Components mặc định.
- Không truy cập database từ presentation component.
- Luồng bắt buộc:

```text
UI → action/controller → service → repository/database
```

- Dữ liệu từ các nguồn sau đều phải validate bằng Zod:
  - Form.
  - URL.
  - File.
  - AI output.
  - Webhook.
  - Query parameters.
- Không dùng `any`.
- Không tắt ESLint hoặc TypeScript để che lỗi.
- Không hardcode:
  - Secret.
  - Model name.
  - Service URL.
  - Environment-specific value.
- Mọi biến môi trường mới phải có trong `.env.example`.
- Không commit:
  - `.env`
  - Log.
  - `.next`
  - File build.
  - `node_modules`
- Không tự ý xóa hoặc bỏ thay đổi đã tồn tại trong working tree.
- Mọi thay đổi phải nằm đúng scope của task.

## 2.2. Rule dữ liệu và bảo mật

- Mọi truy vấn dữ liệu người dùng phải có:
  - `userId`; hoặc
  - Tenant scope.
- Không tin `userId` gửi từ client.
- User identity phải lấy từ session phía server.
- Kiểm tra ownership ở server cho mọi:
  - Read.
  - Update.
  - Delete.
- Migration phải chạy được trên:
  - Database trống.
  - Database đã có dữ liệu.
- Không xóa dữ liệu bằng cascade nếu chưa xác định tác động.
- File upload phải kiểm tra:
  - MIME type.
  - Kích thước.
  - Extension.
  - Quyền sở hữu.
- Rate limit cho:
  - Đăng nhập.
  - Upload.
  - AI endpoint.
- Log không được chứa toàn bộ:
  - CV.
  - JD.
  - Audio transcript.
  - API key.
  - Raw prompt có PII.
- Phải có:
  - Chính sách retention.
  - Xóa dữ liệu cá nhân.
  - Account deletion.
  - Data export.

## 2.3. Rule AI

- AI chỉ đề xuất.
- Người dùng phải duyệt trước khi thay đổi CV.
- AI không được phát minh:
  - Kinh nghiệm.
  - Kỹ năng.
  - Số liệu.
  - Chứng chỉ.
  - Dự án.
  - Thành tích.
- Match Score là chỉ số tham khảo, không phải xác suất được tuyển.
- Mỗi nhận xét phải chỉ ra evidence từ:
  - CV; hoặc
  - JD.
- CV, JD và transcript phải được coi là **untrusted input**.
- Prompt, schema và model phải có version.
- AI output phải:
  - Có schema cấu trúc.
  - Được validate lại phía server.
- Không gọi live AI trong CI.
- Phải có:
  - Quota.
  - Timeout.
  - Retry có giới hạn.
  - Cost tracking.
  - Refusal handling.
  - Prompt-injection test.
  - Human-review gate.
- Structured output phải đi cùng:
  - JSON Schema.
  - Server-side validation.
  - Eval riêng cho từng use case.
- Audio/transcript là dữ liệu nhạy cảm:
  - Giảm thời gian lưu.
  - Không ghi toàn bộ vào log.
  - Chống prompt injection.
  - Có consent.
  - Có human review.

---

# 3. Definition of Done

Một task chỉ được coi là hoàn thành khi:

- Acceptance criteria đã đạt.
- Có test phù hợp.
- `npm run lint` pass.
- `npm run typecheck` pass.
- Unit/integration/E2E liên quan pass.
- `npm run build` pass.
- `git diff --check` pass.
- Đã kiểm tra:
  - Loading state.
  - Empty state.
  - Error state.
  - Invalid state.
- Đã kiểm tra:
  - Desktop.
  - Tablet.
  - Mobile 320px.
  - Keyboard-only.
- Không có lỗi browser console.
- Diff không chứa thay đổi ngoài scope.
- Tài liệu được cập nhật nếu cần.
- Migration được cập nhật nếu cần.
- `.env.example` được cập nhật nếu cần.
- Không có secret hoặc dữ liệu nhạy cảm trong source, log hoặc test fixture.

---

# 4. Phase 0 — Chốt blueprint và làm sạch baseline

**Thời gian:** 2–3 ngày.

## Mục tiêu

Loại bỏ các quyết định mơ hồ trước khi xây backend.

## Công việc

### 4.1. Xử lý working tree hiện tại

- Xác định lý do `package-lock.json` đang thay đổi.
- Đưa hai file dev log vào `.gitignore` hoặc xử lý theo quyết định của chủ repo.
- Không tự ý bỏ thay đổi có sẵn.
- Ghi lại các file đang modified/untracked và lý do tồn tại.

### 4.2. Sửa Node engine

- Repo đang khai báo Node `>=18.17`.
- Next.js cài đặt yêu cầu tối thiểu Node `20.9`.
- Pin một major thống nhất.
- Khuyến nghị Node 24 cho:
  - Development.
  - CI.
  - Production container.

### 4.3. Giải quyết xung đột tài liệu

- `AGENTS.md` nói tất cả page là client component.
- `MASTER_PROMPT.md` nói Server Components mặc định.
- Chọn **Server Components mặc định**.
- Cập nhật source of truth.
- Loại bỏ rule mâu thuẫn khỏi các tài liệu liên quan.

### 4.4. Chốt MVP và non-goals

Chốt các quyết định:

- Auth provider.
- Database provider.
- Hosting.
- Storage provider.
- AI provider.
- AI budget/token quota.
- Nguồn job.
- Có hoặc không import PDF/DOCX.
- Chính sách lưu audio.
- Chính sách lưu transcript.
- Demo mode có tồn tại hay không.
- Có public job data hay chỉ dùng job do user tạo.

### 4.5. Tạo Architecture Decision Records

Tạo:

```text
docs/adr/
  ADR-001-application-architecture.md
  ADR-002-authentication.md
  ADR-003-data-storage.md
  ADR-004-ai-provider.md
  ADR-005-privacy-retention.md
```

### 4.6. Cập nhật tài liệu

- Cập nhật PRD với acceptance criteria đo được.
- Tạo `.env.example`.
- Tạo backlog theo phase.
- Đồng bộ:
  - `AGENTS.md`
  - `MASTER_PROMPT.md`
  - `DESIGN.md`
  - `PRD`
  - `ROUTES.md`
  - ADR.

## Test

- Chạy baseline `npm run check`.
- Smoke test toàn bộ 8 route.
- Lưu kết quả kiểm tra làm baseline.
- Ghi lại lỗi hiện tại, không sửa ngoài scope nếu chưa được duyệt.

## Exit gate

- Working tree được hiểu rõ.
- Không còn rule mâu thuẫn.
- Các quyết định kiến trúc quan trọng đã được ghi lại.
- Node version đã thống nhất.
- Có `.env.example`.
- Chưa viết tính năng mới trong phase này.

---

# 5. Phase 1 — Nền tảng frontend, responsive và test framework

**Thời gian:** 4–6 ngày.

## Mục tiêu

Biến prototype thành frontend foundation có thể mở rộng an toàn.

## Công việc

### 5.1. Refactor route và component

- Tách route page lớn thành feature components.
- Chỉ giữ `"use client"` ở component thực sự cần:
  - State.
  - Event handler.
  - Browser API.
  - Client-side library.
- Không để page là Client Component chỉ vì đang dùng mock data.

### 5.2. Chuẩn hóa UI component

Tạo hoặc chuẩn hóa:

- Button.
- Input.
- Textarea.
- Select.
- Dialog.
- Confirmation dialog.
- Tabs.
- Badge.
- Toast.
- Skeleton.
- Empty state.
- Error state.
- Loading indicator.

### 5.3. Responsive application shell

- Sidebar thành drawer trên mobile.
- Header không dùng chiều rộng cố định.
- Không horizontal overflow ở 320px.
- Layout hoạt động tốt ở:
  - 320px.
  - 768px.
  - 1440px.

### 5.4. Typography và design system

- Chuyển Google Fonts CSS import sang `next/font`.
- Đồng bộ màu và spacing với `DESIGN.md`.
- Loại bỏ hardcoded design value không cần thiết.
- Dùng design token thay vì lặp magic values.

### 5.5. Next.js states

Thêm:

```text
loading.tsx
error.tsx
not-found.tsx
```

### 5.6. Accessibility

- Label cho input.
- `aria-label` cho icon button.
- Focus visible.
- Keyboard navigation.
- Không chỉ dùng màu để biểu diễn trạng thái.
- Dialog phải:
  - Trap focus.
  - Có escape close.
  - Restore focus.
- Tabs phải dùng đúng semantics.

### 5.7. Test framework

Thiết lập:

- Vitest.
- React Testing Library.
- jsdom.
- Playwright.
- Có thể dùng axe-core.

Thêm scripts:

```json
{
  "scripts": {
    "test": "...",
    "test:unit": "...",
    "test:coverage": "...",
    "test:e2e": "..."
  }
}
```

### 5.8. CI

CI kiểm tra:

- Install bằng `npm ci`.
- Lint.
- Typecheck.
- Unit test.
- Build.

## Test

- Component test cho:
  - Button.
  - Input.
  - Dialog.
  - Tabs.
- Navigation test cho:
  - Sidebar.
  - Header.
- Playwright smoke test toàn bộ route.
- Test viewport:
  - 320.
  - 768.
  - 1440.
- Keyboard-only navigation.
- Accessibility smoke test.

## Exit gate

- UI hiện tại không bị regression lớn.
- Mobile shell sử dụng được.
- Test framework chạy được local và CI.
- Không còn page client component chỉ vì dữ liệu mock.
- Không horizontal overflow ở 320px.

---

# 6. Phase 2 — Database và domain model

**Thời gian:** 4–6 ngày.

## Mục tiêu

Tạo nguồn dữ liệu thật và ranh giới domain rõ ràng.

## Công việc

### 6.1. Database

- Cài PostgreSQL.
- Cài Prisma stable.
- Tạo migration.
- Tạo seed.

### 6.2. Domain models ban đầu

Thiết kế:

- `User`
- `Profile`
- `Resume`
- `ResumeVersion`
- `Experience`
- `Skill`
- `Certificate`
- `Job`
- `SavedJob`
- `Application`
- `ApplicationEvent`
- `MatchAnalysis`
- `OptimizationRun`
- `OptimizationSuggestion`
- `InterviewSession`
- `InterviewQuestion`
- `InterviewAnswer`
- `AiRun`
- `FileAsset`

### 6.3. Schema requirements

- Enum trạng thái ứng tuyển.
- Unique constraint.
- Foreign key.
- Index.
- Timestamp.
- Audit fields.
- Soft delete hoặc archive khi phù hợp.
- Không dùng cascade delete khi chưa review tác động.

### 6.4. Layering

Tạo:

- DB client singleton.
- Repository layer.
- Domain service layer.
- Zod DTO/schema.
- Mapper database model → DTO.

### 6.5. Seed

- Seed một tài khoản demo.
- Seed dữ liệu hiện có.
- Seed phải chạy lặp lại an toàn hoặc có reset riêng cho development.
- Không kết nối UI hàng loạt trong phase này.

## Test

- Migration chạy được trên database trống.
- Migration chạy được trên database đã có dữ liệu.
- Seed chạy lặp lại an toàn hoặc có reset riêng.
- Integration test CRUD cho repository chính.
- Test:
  - Foreign key.
  - Unique constraint.
  - Transaction rollback.
  - Mapping database model → DTO.
- Integration test dùng database test riêng.

## Exit gate

- Database schema được review.
- Migrations được commit.
- Không có database access trong component.
- Integration tests chạy trên database test riêng.
- Repository và service boundary đã rõ ràng.

---

# 7. Phase 3 — Authentication, authorization và onboarding

**Thời gian:** 4–6 ngày.

## Mục tiêu

Mỗi người dùng có workspace riêng và không thể đọc dữ liệu của người khác.

## Công việc

### 7.1. Authentication

Tích hợp Auth.js hoặc provider đã chốt.

MVP khuyến nghị:

- Google OAuth.
- Magic link nếu cần.
- Chưa tự lưu mật khẩu.

### 7.2. Session flow

- Login.
- Logout.
- Session refresh.
- Session expiration.
- Callback error handling.
- Provider timeout handling.

### 7.3. Route protection

- Bảo vệ toàn bộ platform routes.
- Chặn direct URL access khi chưa đăng nhập.
- Trang:
  - Unauthorized.
  - Session expired.

### 7.4. Onboarding

Thu thập:

- Họ tên.
- Chức danh mong muốn.
- Seniority.
- Khu vực.
- Kỹ năng ban đầu.

### 7.5. Ownership helpers

Tạo:

```ts
requireUser()
requireOwnedResume()
requireOwnedApplication()
```

Có thể bổ sung:

```ts
requireOwnedJob()
requireOwnedInterviewSession()
requireOwnedFileAsset()
```

### 7.6. Role

Role cơ bản:

```text
USER
ADMIN
```

### 7.7. Security

- Security headers.
- CSP ban đầu.
- Secure cookie policy.
- Rate limit auth endpoints.
- Audit login.
- Audit thay đổi dữ liệu nhạy cảm.
- Không để secret trong client bundle.

## Test

- Chưa đăng nhập bị chuyển tới login.
- Đăng nhập thành công.
- Đăng xuất thành công.
- Session hết hạn được xử lý.
- User A không đọc dữ liệu User B.
- User A không sửa dữ liệu User B.
- User A không xóa dữ liệu User B.
- Kiểm tra direct URL access.
- Kiểm tra callback lỗi.
- Kiểm tra provider timeout.
- Kiểm tra IDOR cho mọi resource có ownership.

## Exit gate

- Không có route dữ liệu nào bỏ qua authorization.
- IDOR test phải pass 100%.
- Không có secret trong client bundle hoặc log.
- User workspace được tách biệt hoàn toàn.

---

# 8. Phase 4 — Hoàn thiện CV Management

**Thời gian:** 7–10 ngày.

## Mục tiêu

Trang `/my-cv` trở thành tính năng CRUD thật, có lưu và xuất CV.

## Công việc

### 8.1. CV list

- Danh sách nhiều CV.
- Tạo CV.
- Đổi tên.
- Duplicate.
- Archive.
- Xóa.
- Chọn CV mặc định.

### 8.2. CV editor

Chỉnh sửa:

- Personal information.
- Summary.
- Experience.
- Skills.
- Education nếu được duyệt trong Phase 0.
- Project nếu được duyệt trong Phase 0.

### 8.3. Autosave

- Debounce.
- Trạng thái:
  - Saving.
  - Saved.
  - Save failed.
- Retry có kiểm soát.
- Không làm mất dữ liệu khi mạng lỗi.

### 8.4. Concurrent editing

- Chống ghi đè khi hai tab hoặc browser cùng sửa.
- Dùng version field hoặc optimistic concurrency control.
- Hiển thị conflict state rõ ràng.

### 8.5. Version history

- Tạo snapshot.
- Xem version cũ.
- Restore thành version mới.
- Không ghi đè trực tiếp version lịch sử.

### 8.6. Preview và export

- Preview sát dữ liệu thực.
- Print stylesheet.
- Xuất PDF:
  - Phía server; hoặc
  - Qua print flow đã kiểm thử.
- Xử lý:
  - Nội dung dài.
  - Unicode tiếng Việt.
  - Emoji.

### 8.7. File upload

Nếu thuộc MVP:

- Avatar.
- Chứng chỉ.
- MIME validation.
- Size validation.
- Ownership validation.

### 8.8. Import

Import PDF/DOCX nên tách thành **Phase 4B** nếu được duyệt.

## Test

- Zod validation cho mọi field.
- Unit test autosave/debounce.
- Integration test CRUD.
- Integration test ownership.
- E2E:
  - Tạo CV.
  - Thêm kinh nghiệm.
  - Refresh.
  - Dữ liệu vẫn tồn tại.
  - Duplicate.
  - Restore.
  - Delete.
  - Export PDF.
- Test mất mạng khi autosave.
- Test nội dung dài.
- Test emoji.
- Test tiếng Việt.
- Test concurrent update.

## Exit gate

- Không còn mock data trong `/my-cv`.
- Refresh không mất dữ liệu.
- Export tạo được tài liệu hợp lệ.
- Không thể sửa CV người khác.
- Version history hoạt động.
- Autosave có error handling rõ ràng.

---

# 9. Phase 5 — Jobs, Saved Jobs và Application Tracker

**Thời gian:** 6–9 ngày.

## Mục tiêu

Hoàn thiện luồng:

```text
Tìm việc → Lưu việc → Ứng tuyển → Theo dõi
```

## Công việc

### 9.1. Jobs

- Job list từ database.
- Job detail route:

```text
/jobs/[id]
```

- Search.
- Filter.
- Sorting.
- Pagination.

### 9.2. Saved jobs

- Bookmark.
- Unbookmark.
- Danh sách saved jobs.
- Không tạo duplicate ngoài ý muốn.

### 9.3. User-created jobs

- Cho phép user paste JD.
- Cho phép user tạo job riêng.
- Chưa scrape website nếu chưa có:
  - Quyết định pháp lý.
  - Nguồn dữ liệu.
  - Điều khoản sử dụng phù hợp.

### 9.4. Application tracker

Tạo application từ job.

Trạng thái:

- Applied.
- Interview.
- Offer.
- Rejected.
- Withdrawn nếu được duyệt.

### 9.5. Kanban

- Drag-and-drop.
- Có keyboard alternative.
- Có nút thay đổi trạng thái thay thế drag-and-drop.
- Optimistic UI.
- Rollback khi server lỗi.

### 9.6. Application history

Lưu vào `ApplicationEvent`:

- Trạng thái cũ.
- Trạng thái mới.
- Thời gian.
- User.
- Note nếu có.

### 9.7. Application fields

- Notes.
- Ngày ứng tuyển.
- Interview date.
- Link.
- Concurrent update handling.

## Test

- Search.
- Filter.
- Pagination.
- Bookmark/unbookmark.
- Tạo application không duplicate ngoài ý muốn.
- Di chuyển Kanban.
- Refresh vẫn đúng trạng thái.
- Application history đúng thứ tự.
- Authorization cho:
  - Job riêng.
  - Application.
- E2E từ job detail tới tracker.
- Test optimistic rollback.
- Test concurrent update.

## Exit gate

- `/jobs` không còn mock.
- `/tracker` không còn mock.
- Mọi chuyển trạng thái được lưu lịch sử.
- Không mất dữ liệu khi request thất bại.
- Keyboard user có thể thay đổi trạng thái mà không cần kéo thả.

---

# 10. Phase 6 — AI Platform Foundation

**Thời gian:** 5–7 ngày.

## Mục tiêu

Xây nền AI an toàn, có thể thay provider và đo được trước khi triển khai tính năng AI.

## Công việc

### 10.1. AI provider interface

```ts
interface AIProvider {
  analyzeResume(...): Promise<ResumeAnalysis>;
  matchResumeToJob(...): Promise<JobMatchResult>;
  optimizeResume(...): Promise<OptimizationResult>;
  generateInterviewQuestions(...): Promise<InterviewQuestionSet>;
  evaluateInterviewAnswer(...): Promise<InterviewFeedback>;
}
```

### 10.2. Provider abstraction

- Provider được chọn qua environment.
- Component không import SDK AI.
- Domain service chỉ phụ thuộc interface.
- Có mock provider cho local test và CI.

### 10.3. Structured output

- Dùng Zod hoặc JSON Schema.
- Validate lại output phía server.
- Xử lý:
  - Invalid schema.
  - Refusal.
  - Timeout.
  - Malformed response.
  - Partial response.

### 10.4. AiRun

Tạo bảng `AiRun` lưu:

- Feature.
- User.
- Model/provider.
- Prompt version.
- Schema version.
- Token usage.
- Latency.
- Status.
- Error category.
- Cost estimate.
- Request ID.
- Idempotency key.

Không lưu raw prompt chứa PII mặc định.

### 10.5. Reliability

- Timeout.
- Retry có giới hạn.
- Exponential backoff.
- Idempotency để tránh charge hai lần.
- Rate limit.
- Quota theo user.
- Cost budget theo ngày.
- Cost budget theo tháng.

### 10.6. Cache

Cache theo hash của:

```text
CV version
+ Job version
+ Prompt version
+ Schema version
+ Provider/model version
```

Cache phải có user scope khi dữ liệu có tính cá nhân.

### 10.7. Prompt registry

- Không để prompt rải rác trong code.
- Mỗi prompt có:
  - ID.
  - Version.
  - Feature.
  - Schema version.
  - Changelog.

### 10.8. Eval dataset

Tạo dữ liệu eval đã ẩn danh cho:

- Junior frontend.
- Mid frontend.
- Senior frontend.
- Backend.
- Full-stack.
- Data.
- QA.
- DevOps.
- CV tiếng Việt.
- CV tiếng Anh.
- CV song ngữ.

### 10.9. Security eval

Thêm prompt-injection cases trong:

- JD.
- CV.
- Transcript.

## Test

- Contract test cho mọi AI provider.
- Schema parsing test.
- Timeout test.
- Retry test.
- Refusal test.
- Malformed response test.
- Không gọi live AI trong CI.
- Rate limit test.
- Quota test.
- Idempotency test.
- Prompt-injection test.
- Eval baseline theo prompt version.
- Cost tracking test.
- Cache-key correctness test.

## Exit gate

- Structured output hợp lệ sau retry đạt ngưỡng đã chốt.
- Khuyến nghị ngưỡng: `>=99%`.
- Không có thao tác ghi vào CV tự động từ AI.
- Cost và latency đo được.
- Có thể đổi provider mà không sửa UI/domain.
- Có mock provider cho local và CI.
- Có prompt registry.
- Có eval baseline.

## Skill bắt buộc

Khi bắt đầu tích hợp OpenAI API hoặc chọn model/API:

- Bắt buộc dùng skill `openai-docs`.
- Phải kiểm tra:
  - Structured output.
  - Refusal handling.
  - Eval.
  - Retention policy.
  - Model/API compatibility.

---

# 11. Phase 7 — ATS, Job Match và CV Optimization

**Thời gian:** 7–10 ngày.

## Mục tiêu

Thay toàn bộ điểm số và đề xuất hardcode bằng kết quả thật, có breakdown và evidence.

## Công việc

### 11.1. Input selection

Người dùng chọn:

- CV version.
- Job hoặc JD.

### 11.2. Skill taxonomy

Chuẩn hóa:

- Exact match.
- Alias.
- Related skill.

Không suy diễn kỹ năng không có evidence.

### 11.3. ATS hybrid

ATS gồm:

- Rule-based:
  - Cấu trúc.
  - Section.
  - Keyword.
  - Formatting.
- AI:
  - Giải thích.
  - Đề xuất.
  - Evidence mapping.

### 11.4. Score transparency

Công khai thành phần điểm.

Không tạo “điểm bí ẩn”.

### 11.5. Job Match

Breakdown:

- Hard skills.
- Experience.
- Education nếu có.
- Domain/context.

Mỗi kết luận phải có evidence từ:

- CV.
- JD.

### 11.6. Optimization

- Missing keywords.
- Matched keywords.
- Rewrite suggestion.
- Before/after diff.
- Accept từng đề xuất.
- Reject từng đề xuất.
- Reject toàn bộ.

### 11.7. Versioning

- Khi accept suggestion, tạo `ResumeVersion` mới.
- Không sửa CV gốc âm thầm.
- Lưu source analysis và accepted suggestions.

### 11.8. UX states

- Loading.
- Progress.
- Error.
- Partial result.
- Retry.
- History.
- Run again.

## Test

- Unit test score calculation.
- Golden dataset test.
- Cùng input phải có breakdown nhất quán trong phạm vi cho phép.
- Factual-preservation eval.
- Test JD chứa prompt injection.
- Test CV thiếu dữ liệu.
- Test AI refusal.
- Test AI timeout.
- E2E:

```text
Chọn CV
→ Chọn job
→ Phân tích
→ Duyệt suggestion
→ Tạo ResumeVersion
```

## Exit gate

- Không còn score hardcode.
- Mọi điểm số có breakdown.
- Mọi nhận xét có evidence.
- Không có suggestion làm thay đổi sự thật trong bộ must-pass eval.
- Người dùng có thể từ chối toàn bộ suggestion.
- CV gốc không bị sửa âm thầm.

---

# 12. Phase 8 — AI Interview

**Thời gian:** 7–12 ngày.

## Mục tiêu

Hoàn thiện phỏng vấn theo hai bước:

1. Text interview.
2. Audio interview.

Text phải ổn định trước khi triển khai audio.

---

## Phase 8A — Text interview

### Công việc

- Chọn CV.
- Chọn job.
- Tạo câu hỏi bám vào CV/JD.
- Rubric rõ ràng cho từng câu.
- Nhập câu trả lời dạng text.
- Feedback gồm:
  - Điểm theo rubric.
  - Điểm mạnh.
  - Điểm thiếu.
  - Gợi ý cải thiện.
  - Evidence.
- Session history.
- Resume session.
- Không dùng điểm hardcode như `9.5/10`.

### Test

- Question generation eval.
- Rubric grading eval.
- E2E text interview.
- Resume session test.
- Ownership test.
- Prompt-injection test.
- Timeout/refusal test.

### Exit gate

- Text interview ổn định.
- Câu hỏi liên quan CV/JD.
- Feedback dựa trên rubric và evidence.
- Không dùng điểm hardcode.

---

## Phase 8B — Audio interview

### Công việc

- Xin consent rõ trước khi ghi âm.
- Dùng `MediaRecorder`.
- Xử lý:
  - Mic denied.
  - Device missing.
  - Recording interrupted.
  - Browser unsupported.
- Upload trực tiếp bằng signed URL.
- Transcription phía server.
- Xóa raw audio theo retention policy.
- Không ghi transcript đầy đủ vào log.
- Realtime voice chỉ triển khai sau khi async audio ổn định.

### Test

- Mic denied.
- Browser unsupported.
- File type validation.
- File size validation.
- Upload interrupted.
- Upload retry.
- User A không nghe được audio User B.
- E2E audio dùng fixture thay vì mic thật trong CI.

### Exit gate

- Text interview ổn định trước khi bật audio.
- Có consent.
- Có retention policy.
- Transcript, audio và feedback được bảo vệ theo user.
- Mọi feedback liên quan:
  - Câu hỏi.
  - CV.
  - Job đã chọn.

---

# 13. Phase 9 — Dashboard, Profile và loại bỏ mock data

**Thời gian:** 4–6 ngày.

## Mục tiêu

Kết nối toàn bộ route thành một sản phẩm thống nhất.

## Công việc

### 13.1. Dashboard

Dùng dữ liệu thật:

- ATS gần nhất.
- Saved jobs.
- Applications.
- Interview score.
- Response rate.
- Activity timeline.

### 13.2. Profile

- Có thể lấy dữ liệu từ CV.
- Cho phép override rõ ràng.
- Có rule đồng bộ Profile/CV.

### 13.3. Certificates

- CRUD chứng chỉ.
- Upload file nếu nằm trong MVP.
- Ownership validation.

### 13.4. Header actions

- Global search phải hoạt động hoặc bỏ khỏi header.
- Notification button phải có chức năng hoặc không hiển thị.

### 13.5. Empty onboarding

- Dashboard phù hợp cho user mới.
- Không hiển thị demo stats trong tài khoản thật.

### 13.6. Demo mode

- Tách bằng feature flag.
- Không trộn demo data với production path.

### 13.7. Route consistency

- Kiểm tra toàn bộ quan hệ trong `ROUTES.md`.
- Tất cả CTA phải có đích đến hợp lệ.

## Test

- Aggregate query.
- Empty account.
- Account có nhiều CV/application.
- Dashboard cập nhật sau mutation.
- Profile/CV sync rule.
- E2E happy path chính.
- Test CTA.
- Test demo flag.

## Exit gate

- Không còn số liệu mock trên production path.
- Tất cả CTA đều hoạt động.
- Dữ liệu giữa các màn hình nhất quán.
- Demo mode được tách biệt.

---

# 14. Phase 10 — Production hardening

**Thời gian:** 6–9 ngày.

## Mục tiêu

Đảm bảo hệ thống an toàn, quan sát được và chịu lỗi tốt.

## Công việc

### 14.1. Observability

- Structured logging.
- Request ID.
- Error monitoring.
- Metrics:
  - Error rate.
  - API latency.
  - AI latency.
  - Token/cost.
  - AI schema failure.
  - Provider failure.
  - Upload failure.

### 14.2. Health

- Health endpoint.
- Readiness endpoint.

### 14.3. Security

- CSP.
- Security headers.
- Cookie policy.
- Rate limiting toàn hệ thống.
- Secret scanning.
- Dependency audit.
- File scanning strategy.
- Authorization audit.
- Upload security audit.

### 14.4. Data protection

- Backup.
- Restore drill.
- Data export.
- Account deletion.
- Privacy policy.
- Consent.

### 14.5. Performance

- Query indexes.
- Cache có user scope.
- Bundle analysis.
- Font optimization.
- Image optimization.
- N+1 query review.

### 14.6. Accessibility

- WCAG 2.1 AA audit.
- Keyboard-only audit.
- Screen reader smoke test.

### 14.7. Cross-browser

- Chromium.
- Firefox.
- WebKit.

### 14.8. Load testing

Load test endpoint chính:

- Auth callback.
- CV save.
- Job search.
- Tracker mutation.
- AI request initiation.
- Signed upload URL.

### 14.9. Runbook

Tạo runbook cho:

- Database outage.
- AI provider outage.
- Storage outage.
- Migration failure.
- Cost spike.
- Authentication provider outage.

## Test và gate đề xuất

- Không còn lỗ hổng critical/high đã biết.
- P95 non-AI mutation dưới 500–800ms trong staging.
- AI có progress/streaming hoặc phản hồi trong latency budget đã chốt.
- Lighthouse accessibility `>=95`.
- Không horizontal overflow tại 320px.
- Backup restore thành công.
- AI provider down không làm sập phần CV/tracker.
- E2E pass trên Chromium, Firefox và WebKit.

## Exit gate

- Monitoring và alert hoạt động.
- Backup restore đã được thử.
- Runbook tồn tại.
- AI outage được cô lập.
- Security gate đạt yêu cầu.

---

# 15. Phase 11 — Staging, production và beta release

**Thời gian:** 3–5 ngày.

## Công việc

### 15.1. Environments

Tạo riêng:

- Development.
- Staging.
- Production.

Database và storage riêng cho từng môi trường.

### 15.2. Preview deployment

- Preview deployment cho Pull Request.
- Không dùng production secret trong preview.

### 15.3. CI/CD

Pipeline:

1. `npm ci`
2. Lint
3. Typecheck
4. Unit test
5. Integration test
6. Build
7. E2E staging

### 15.4. Migration

- Production migration theo hướng expand/contract.
- Có rollback procedure.
- Không dùng destructive migration trực tiếp.

### 15.5. Production setup

- Domain.
- HTTPS.
- Redirect.
- Backup schedule.
- Monitoring.
- Alert.
- Secret management.

### 15.6. Seed policy

- Seed chỉ dùng development/staging.
- Không có demo data trong production.

### 15.7. Beta

Beta với 5–10 người dùng.

Thu feedback theo luồng:

1. Tạo CV.
2. Tối ưu theo JD.
3. Match.
4. Apply/tracker.
5. Interview.

## Exit gate

- Staging và production tách biệt.
- Có rollback đã thử.
- Monitoring và alert hoạt động.
- Không có demo data trong production.
- Beta checklist được ký duyệt.

---

# 16. Phase 12 — Sau khi ra mắt

Đây là vòng lặp liên tục.

## Công việc

- Theo dõi funnel.
- Theo dõi lỗi.
- Review chi phí AI hàng tuần.
- Lấy failure case đã ẩn danh bổ sung vào eval.
- So sánh prompt/model mới với baseline trước khi release.
- Theo dõi drift của Match Score.
- A/B test:
  - Onboarding.
  - CV optimization.
- Tích hợp nguồn job chính thức khi có hợp đồng/API.
- Chỉ thêm realtime interview khi text/audio async đã có dữ liệu chứng minh nhu cầu.

---

# 17. Test strategy tổng thể

| Loại test | Công cụ | Phạm vi |
|---|---|---|
| Unit | Vitest | Score, validation, mapper, domain logic |
| Component | React Testing Library + user-event | Form, tabs, dialog, loading/error |
| Integration | Vitest + PostgreSQL test DB | Repository, service, Server Action |
| Contract | Mock provider | AI, storage, auth callback |
| E2E | Playwright | Các luồng người dùng quan trọng |
| Accessibility | axe + manual keyboard | WCAG, focus, label |
| AI eval | Dataset versioned | Factuality, evidence, schema, injection |
| Performance | Lighthouse + load test | UI, API, DB |
| Security | Audit + authorization tests | IDOR, upload, rate limit, secret |

## Coverage mục tiêu ban đầu

- Domain/service logic:
  - Branch coverage `>=85%`.
- Toàn dự án:
  - Line coverage `>=70%`.
- Authorization path:
  - Có test cho 100% resource có ownership.

Coverage không thay thế:

- E2E.
- Accessibility test.
- Security test.
- AI eval.

---

# 18. Skill cần cho từng nhóm công việc

## Phase 0–1

- Kiến trúc Next.js.
- TypeScript strict.
- Responsive design.
- Accessibility.
- Test foundation.

## Phase 2

- PostgreSQL.
- Prisma.
- Transaction.
- Migration design.
- Indexing.
- Data modeling.

## Phase 3

- Authentication.
- Session security.
- OAuth.
- Authorization.
- IDOR prevention.

## Phase 4

- Complex forms.
- Autosave.
- Concurrency control.
- Document generation.
- File storage.

## Phase 5

- Search.
- Pagination.
- Optimistic update.
- Accessible drag-and-drop.
- Event history.

## Phase 6–8

- Prompt engineering.
- Structured output.
- Eval design.
- Privacy.
- AI threat modeling.
- Prompt injection defense.
- Cost tracking.
- Provider abstraction.

## Phase 10–11

- Observability.
- AppSec.
- Performance.
- CI/CD.
- Backup/restore.
- Production operations.

## Skill Codex cụ thể

### `openai-docs`

Bắt buộc khi:

- Bắt đầu tích hợp OpenAI.
- Chọn model.
- Chọn API.
- Thiết kế structured output.
- Thiết kế refusal handling.
- Thiết kế retention.
- Thiết kế eval.

### `imagegen`

Chỉ dùng nếu cần tạo:

- Bitmap.
- Avatar.
- Illustration.

Không dùng `imagegen` để xây:

- UI HTML/CSS.
- Component system.
- Icon system.

Các phase web thông thường chưa cần plugin bổ sung. Repo và tài liệu Next.js cục bộ đã đủ để bắt đầu.

---

# 19. Thứ tự thực hiện khuyến nghị

Thực hiện tuần tự:

```text
0 → 1 → 2 → 3 → 4 → 5 → 6 → 7 → 8 → 9 → 10 → 11
```

Không nên bắt đầu AI ở Phase 6–8 trước khi hoàn tất:

- Authentication.
- CV persistence.
- Job persistence.

Nếu làm AI sớm hơn:

- AI sẽ tiếp tục phân tích mock data.
- Integration sẽ phải viết lại.
- Schema và authorization sẽ bị chắp vá.
- Chi phí test và migration tăng mạnh.

## Mốc hợp lý

- Sau Phase 3:
  - Nền tảng backend an toàn.
- Sau Phase 5:
  - Sản phẩm quản lý CV/job/application sử dụng được dù chưa có AI.
- Sau Phase 7:
  - MVP AI cốt lõi.
- Sau Phase 9:
  - Feature-complete.
- Sau Phase 11:
  - Production beta.

## Phase phải bắt đầu trước

**Phase 0**, đặc biệt để xử lý:

- Rule mâu thuẫn.
- Node engine.
- Working tree.
- Năm quyết định kiến trúc chưa được chốt.

---

# 20. Backlog thực thi đề xuất

Agent code phải làm từng task nhỏ, không gom toàn bộ phase thành một thay đổi lớn.

Mỗi task nên có:

```text
Task ID
Phase
Mục tiêu
Scope
Files dự kiến thay đổi
Acceptance criteria
Test bắt buộc
Out of scope
Risk
Definition of Done
```

Ví dụ:

```text
Task ID: P1-UI-001
Phase: 1
Mục tiêu: Chuẩn hóa Button component
Scope:
- components/ui/button.tsx
- tests/unit/components/button.test.tsx

Acceptance criteria:
- Hỗ trợ variant primary, secondary, ghost, danger
- Hỗ trợ disabled và loading
- Có focus-visible
- Không dùng any

Test:
- Render đúng variant
- Disabled không trigger click
- Loading có accessible label

Out of scope:
- Không thay toàn bộ button trong repo ở task này
```

---

# 21. Quy tắc làm việc dành cho agent code

Trước mỗi task:

1. Đọc tài liệu liên quan.
2. Kiểm tra `git status`.
3. Không xóa thay đổi có sẵn.
4. Xác định đúng scope.
5. Ghi acceptance criteria.
6. Xác định test cần thêm.

Trong khi làm:

1. Giữ Server Components mặc định.
2. Không truy cập DB từ component.
3. Validate input bằng Zod.
4. Không dùng `any`.
5. Không hardcode secret hoặc service config.
6. Không thay đổi file ngoài scope.
7. Không tắt lint/typecheck.
8. Không gọi live AI trong test.

Sau khi làm:

1. Chạy test liên quan.
2. Chạy lint.
3. Chạy typecheck.
4. Chạy build nếu task ảnh hưởng production path.
5. Chạy `git diff --check`.
6. Review diff.
7. Cập nhật tài liệu, migration và `.env.example` nếu cần.
8. Báo cáo:
   - File đã thay đổi.
   - Test đã chạy.
   - Kết quả.
   - Rủi ro còn lại.
   - Việc chưa làm.

---

# 22. Lệnh kiểm tra chuẩn

Agent nên ưu tiên các lệnh sau nếu đã tồn tại trong repo:

```bash
npm ci
npm run lint
npm run typecheck
npm run test:unit
npm run test:coverage
npm run test:e2e
npm run build
git diff --check
```

Nếu repo có script tổng hợp:

```bash
npm run check
```

Không tự tạo script khác tên nếu chưa cần thiết.

---

# 23. Nguyên tắc ưu tiên

Khi có xung đột về thời gian hoặc scope, ưu tiên theo thứ tự:

1. Bảo mật và ownership.
2. Không mất dữ liệu.
3. Migration an toàn.
4. Validation.
5. Test.
6. Accessibility.
7. Performance.
8. AI quality.
9. UI polish.
10. Tính năng phụ.

---

# 24. Kết luận

Lumina AI nên được triển khai theo hướng:

```text
Blueprint
→ Frontend foundation
→ Database
→ Authentication
→ CV persistence
→ Job/application persistence
→ AI foundation
→ ATS/Matching/Optimization
→ Interview
→ Dashboard integration
→ Production hardening
→ Beta release
```

Không bắt đầu AI khi dữ liệu, authentication và ownership chưa ổn định.

Task đầu tiên phải thuộc **Phase 0**.
