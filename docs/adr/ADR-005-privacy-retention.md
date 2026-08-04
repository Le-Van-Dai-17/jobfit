# ADR-005: Privacy, Data Retention & Audio/Transcript Governance

* **Status:** Accepted
* **Date:** 2026-08-04
* **Deciders:** Lumina AI Engineering Team

---

## Context & Problem Statement

CVs, work histories, audio recordings of phỏng vấn (mock interviews), and generated transcripts contain Personally Identifiable Information (PII) and sensitive personal career data.

## Decision Drivers

* User trust and consent.
* Compliance with privacy best practices.
* System logging safety (preventing accidental exposure of PII in logs).

## Decision Outcome

Chosen Option: **Strict Retention Policies, Explicit Consent Flow, and PII Log Masking**.

### Privacy Policies:
1. **Explicit Audio Consent**: Audio recording requires clear user consent prior to enabling microphone access.
2. **Audio Data Retention**: Raw audio recordings deleted after processing according to the retention window.
3. **Log Sanitization**: Full CVs, JDs, raw prompts with PII, and complete interview transcripts must NEVER be written to stdout or application logs.
4. **Data Ownership & Export**: Users can export their personal data and request complete account & data deletion at any time.

## Consequences

* **Positive**: High privacy protection, reduced compliance and data breach risk.
* **Negative**: Requires automated cleanup cron jobs for ephemeral audio files.
