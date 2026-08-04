# ADR-001: Next.js App Router Modular Monolith Architecture

* **Status:** Accepted
* **Date:** 2026-08-04
* **Deciders:** Lumina AI Engineering Team

---

## Context & Problem Statement

Lumina AI started as a frontend prototype. Moving into MVP production requires a scalable architecture that allows fast iteration, strong maintainability, clean separation of concerns, and low operational overhead.

## Decision Drivers

* High velocity for a single developer or small team.
* Clear architectural boundary: presentation components must not access database or AI providers directly.
* Easy deployment, monitoring, and scaling on standard Next.js hosting (Vercel or Docker container).

## Considered Options

1. **Next.js App Router Modular Monolith** (Server Components default, Server Actions/Route Handlers, Feature Modules).
2. **Microservices Architecture** (Separate Frontend, Node.js Backend API, Python AI Service).
3. **Single Page Application (Client-only)** with external BaaS (Supabase/Firebase).

## Decision Outcome

Chosen Option: **Option 1: Next.js App Router Modular Monolith**.

### Architecture Principles:
- **Server Components by default**: Minimizes client-side JavaScript, improves performance and SEO.
- **Client Components on demand**: Used strictly for interactive state, event handlers, or browser APIs (`"use client"`).
- **Domain Layering**: `UI -> Server Action / Route Handler -> Domain Service -> Repository -> Database / External Provider`.
- **Feature-based directory structure**: Business domain code lives inside `features/<domain>/` (resumes, jobs, matching, interviews, etc.).

## Consequences

* **Positive**: Shared TypeScript types across frontend and backend, single repository, fast deployment.
* **Negative**: Requires strict discipline to prevent business logic leak into UI components.
