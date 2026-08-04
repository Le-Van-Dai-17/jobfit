# ADR-003: Database and Object Storage Architecture

* **Status:** Accepted
* **Date:** 2026-08-04
* **Deciders:** Lumina AI Engineering Team

---

## Context & Problem Statement

Lumina AI requires relational data persistence (User, Profile, Resume, Version History, Job, Application, Interview Session, AI Runs) and file asset storage (Certificates, Avatars, Interview Audio).

## Decision Drivers

* Relational integrity (foreign keys, unique constraints, transactional safety).
* Type-safe database queries.
* Secure file storage with signed URLs.

## Decision Outcome

Chosen Option: **PostgreSQL (via Supabase)** + **Prisma ORM (Stable)** for relational data, and **Supabase Storage** (S3-compatible) for file assets.

### Data Architecture Strategy:
1. **Prisma ORM Stable**: Avoid experimental/early access releases to guarantee production stability. We will connect Prisma directly to Supabase's PostgreSQL connection pooler (Transaction mode).
2. **Migrations**: All DB changes managed via Prisma Migrations (`prisma migrate dev`), applied directly to Supabase.
3. **Repository Pattern**: Components access database exclusively via repository services (`lib/db/` & `features/*/repositories/`).
4. **Storage Access**: Supabase Storage will be used for file assets (Avatar, Audio, PDF). We will use Server Route Handlers / Signed URLs. Pre-signed URLs for downloading user-owned file assets.
5. **No Blind Cascade Delete**: Cascade operations must be explicitly reviewed for security and data loss prevention.

## Consequences

* **Positive**: Fully typed DTO mapping, standard SQL database migration control, isolated file storage.
* **Negative**: Requires database setup and migration workflow management in dev and staging environments.
