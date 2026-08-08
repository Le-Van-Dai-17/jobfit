# Routes - CV_KADA

## UI Routes

| Route | File | Status | Notes |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Implemented, partial data | Dashboard overview with some demo metrics/state. |
| `/login` | `app/login/page.tsx` | Implemented | Auth.js sign-in UI, including demo credentials path. |
| `/my-cv` | `app/my-cv/page.tsx` | Partial | CV editor and preview with save action/backend support; persistence flow needs hardening. |
| `/job-optimization` | `app/job-optimization/page.tsx` | Partial | Calls AI optimization route when authenticated and configured. |
| `/job-match` | `app/job-match/page.tsx` | Partial | Calls AI match route; structured persistence is not complete. |
| `/jobs` | `app/jobs/page.tsx` | Partial/mock | Job repository exists; screen still contains demo/client behavior. |
| `/interview` | `app/interview/page.tsx` | Partial | AI question/evaluation routes exist; persistence and consent handling are incomplete. |
| `/tracker` | `app/tracker/page.tsx` | Partial/mock | Application API/model exists; Kanban state still needs full persistence. |
| `/profile` | `app/profile/page.tsx` | Mock | Profile model exists; page is primarily demo presentation. |

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
  -> AiRun
  -> FileAsset

ResumeVersion + Job
  -> MatchAnalysis
```

## Not Yet Routed

- Assessment session, engineering task, submission, rubric result, and employer-safe assessment report routes are not implemented yet. They are the Milestone 1 vertical slice.
