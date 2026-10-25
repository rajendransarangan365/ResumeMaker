# ATS Resume Intelligence Studio - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased] - 2026-10-25

### Added
- Monorepo directory structure established with npm workspaces: `apps/web`, `apps/api`, `packages/shared-types`, `packages/resume-schema`, `packages/template-registry`, `packages/resume-renderer`.
- Comprehensive foundational documentation suite:
  - `ARCHITECTURE.md`: High-level system architecture, security boundaries, and data flow.
  - `REQUIREMENTS.md`: Detailed functional and non-functional requirement specifications.
  - `SECURITY.md`: Encryption standards, OTP validation, rate-limiting rules, and secret protection.
  - `AI.md`: Gemini GenAI SDK architecture, anti-hallucination guardrails, and usage accounting.
  - `API_SPECIFICATION.md`: REST API endpoint definitions, request/response models, and error envelopes.
  - `DATABASE_SCHEMA.md`: MongoDB Mongoose schema models, indexes, and relationship definitions.
  - `TESTING.md`: Automated and manual testing matrices across units, routes, and viewports.
  - `DEPLOYMENT.md`: Multi-tier cloud, standalone PC, and Android PWA deployment guidelines.
  - `INSTRUCTIONS.md`: Step-by-step user and administrative operating instructions.
  - `.env.example`: Centralized blueprint of all runtime environment variables.
  - `.gitignore`: Security-conscious git ignore rules preventing credential leaks.
