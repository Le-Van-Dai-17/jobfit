# ADR-002: Authentication & Authorization Strategy

* **Status:** Accepted
* **Date:** 2026-08-04
* **Deciders:** Lumina AI Engineering Team

---

## Context & Problem Statement

Users store sensitive professional data (resumes, work history, target jobs, interview audio/transcripts). We need a secure authentication and strict authorization scheme to prevent IDOR (Insecure Direct Object Reference) and unauthorized data access.

## Decision Drivers

* Seamless user experience (Google OAuth, Magic Links).
* Server-side session verification for every data read/write operation.
* Zero trust of user IDs sent from client payloads.

## Decision Outcome

Chosen Option: **Auth.js (NextAuth.js) with Google OAuth & Server-side ownership verification**.

### Security Rules:
1. **Server Session Validation**: All Server Actions and Route Handlers must obtain identity directly from server session (`auth()`), never trusting `userId` passed from client parameters.
2. **Ownership Check Helpers**: Mandatory server-side ownership checks (`requireUser()`, `requireOwnedResume()`, `requireOwnedApplication()`, `requireOwnedInterviewSession()`).
3. **Role-Based Access Control**: Basic `USER` and `ADMIN` roles.
4. **Secure Cookies & Headers**: HTTP-only, secure, same-site cookies with rate limiting on auth endpoints.

## Consequences

* **Positive**: Complete user isolation, high resistance against IDOR vulnerabilities.
* **Negative**: OAuth provider dependency; requires robust timeout and error handling.
