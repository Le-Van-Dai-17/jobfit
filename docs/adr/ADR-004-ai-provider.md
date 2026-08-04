# ADR-004: AI Provider Abstraction & Reliability System

* **Status:** Accepted
* **Date:** 2026-08-04
* **Deciders:** Lumina AI Engineering Team

---

## Context & Problem Statement

AI capabilities (ATS scoring, Job matching, CV optimization, Mock interviews) are core value propositions of Lumina AI. However, direct SDK vendor lock-in, unvalidated responses, latency, and prompt-injection risks create high operational risk.

## Decision Drivers

* Ability to switch AI providers (OpenAI, Anthropic, Gemini, Mock Provider) without changing UI or domain code.
* Strict structured JSON output validated by Zod schemas.
* Cost control, rate limiting, and execution auditing.

## Decision Outcome

Chosen Option: **Abstract `AIProvider` Adapter Pattern + Central Prompt Registry + Server-Side Zod Validation + `AiRun` Audit Table**.

### Core AI Rules:
1. **Interface Adapter**: UI/Services interact exclusively with `AIProvider` interface. Zero direct AI SDK calls in presentation components.
2. **Structured Output**: AI responses must follow JSON Schema / Zod definitions. Validated on server.
3. **No Hidden Mutations**: AI suggestions are advisory. User must explicitly approve changes to CV/Profile. AI must NEVER invent skills, experiences, or metrics.
4. **Audit & Cost Tracking**: Every AI interaction creates an `AiRun` record (model, prompt version, tokens, latency, status, cost). PII is redacted from raw logs.
5. **Caching & Idempotency**: AI requests cached by hash (`CV ver + Job ver + Prompt ver + Schema ver`).
6. **Testing**: Live AI calls strictly prohibited in CI. Mock AI Provider used for unit and integration testing.

## Consequences

* **Positive**: High resilience, zero lock-in, cost visibility, immunity to LLM hallucination silent overrides.
* **Negative**: Higher initial setup overhead for adapter interfaces and evaluation datasets.
