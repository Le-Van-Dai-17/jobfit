# Routes - CV_KADA

## UI Routes

| Route | File | Status | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Implemented, partial data | Dashboard overview with some demo metrics/state. |
| `/login` | `app/login/page.tsx` | Implemented | Auth.js sign-in UI, including demo credentials path. |
| `/my-cv` | `app/my-cv/page.tsx` | Partial | CV editor and preview with save action/backend support; persistence flow needs hardening. |
| `/job-optimization` | `app/job-optimization/page.tsx` | Partial | Calls AI optimization route when authenticated and configured. |
| `/job-match` | `app/job-match/page.tsx` | Partial | Calls AI match route; structured persistence is not complete. |
| `/jobs` | `app/jobs/page.tsx` | Partial/mock | Job repository exists; screen still contains demo/client behavior, with a handoff CTA into assessments. |
| `/assessments` | `app/assessments/page.tsx` | Implemented | Candidate selects user-owned CV version and JD, supports safe query preselection, creates realistic engineering tasks, handles missing CV/JD states, and sees recent sessions. |
| `/assessments/[sessionId]` | `app/assessments/[sessionId]/page.tsx` | Implemented | Candidate submits text solutions and sees persisted advisory rubric/evidence report; unauthorized access renders an ownership-safe denial state. |
| `/interview` | `app/interview/page.tsx` | Partial | AI question/evaluation routes exist; persistence and consent handling are incomplete. |
| `/tracker` | `app/tracker/page.tsx` | Partial/mock | Application API/model exists; Kanban state still needs full persistence. |
| `/profile` | `app/profile/page.tsx` | Mock | Profile model exists; page is primarily demo presentation. |
| `/recruiter` | `app/recruiter/page.tsx` | Implemented | Recruiter dashboard counts scoped to authenticated company membership; recruiters without membership are redirected to onboarding. |
| `/recruiter/jobs` | `app/recruiter/jobs/page.tsx` | Implemented | Lists company-owned jobs/JDs and supports publish/archive actions. |
| `/recruiter/jobs/new` | `app/recruiter/jobs/new/page.tsx` | Implemented | Creates company-owned draft jobs through server-side Zod validation. |
| `/recruiter/jobs/[jobId]` | `app/recruiter/jobs/[jobId]/page.tsx` | Implemented | Company-scoped job detail; cross-company access returns not found. |
| `/recruiter/candidates` | `app/recruiter/candidates/page.tsx` | Implemented | Candidate pipeline lists only applications to company-owned jobs and supports status filtering. |
| `/recruiter/candidates/[applicationId]` | `app/recruiter/candidates/[applicationId]/page.tsx` | Implemented | Company-scoped application detail and audited recruiter status transitions. |
| `/recruiter/assessments` | `app/recruiter/assessments/page.tsx` | Implemented | Lists employer-safe assessment reports available through company-owned applications. |
| `/recruiter/assessments/[applicationId]` | `app/recruiter/assessments/[applicationId]/page.tsx` | Implemented | Employer-safe report detail; denied access fails closed without existence leakage. |
| `/recruiter/company` | `app/recruiter/company/page.tsx` | Implemented | Shows the authenticated recruiter's company membership details. |
| `/recruiter/company/onboarding` | `app/recruiter/company/onboarding/page.tsx` | Implemented | Creates recruiter company membership for recruiters without a company. |

## API And Server Routes

| Route | File | Status | Notes |
| --- | --- | --- | --- |
| `/api/auth/[...nextauth]` | `app/api/auth/[...nextauth]/route.ts` | Implemented | Auth.js route handlers. |
| `/api/applications` | `app/api/applications/route.ts` | Partial | Application operations with authenticated user context. |
| `/api/ai/match` | `app/api/ai/match/route.ts` | Partial/live credential | Requires auth, a user-owned resume, and `GEMINI_API_KEY` for live calls. |
| `/api/ai/optimize` | `app/api/ai/optimize/route.ts` | Partial/live credential | Requires auth, a user-owned resume, and `GEMINI_API_KEY` for live calls. |
| `/api/ai/interview/generate` | `app/api/ai/interview/generate/route.ts` | Partial/live credential | Generates interview questions through Gemini. |
| `/api/ai/interview/evaluate` | `app/api/ai/interview/evaluate/route.ts` | Partial/live credential | Evaluates interview answers through Gemini. |

## Data Relationships

```text
User
  -> Profile -> Experience / Education / Skill / Certificate
  -> Resume -> ResumeVersion
  -> SavedJob -> Job
  -> Application -> Job + optional ResumeVersion
  -> InterviewSession -> Job? -> InterviewQuestion -> InterviewAnswer
  -> AssessmentSession -> AssessmentTask / AssessmentSubmission / AssessmentResult
  -> AiRun
  -> FileAsset

ResumeVersion + Job
  -> MatchAnalysis
  -> AssessmentSession
```

## Not Yet Routed

- External employer sharing links are not implemented; recruiter report access requires authenticated company membership.
