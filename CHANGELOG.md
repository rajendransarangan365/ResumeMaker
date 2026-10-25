# ATS Resume Intelligence Studio - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

# ATS Resume Intelligence Studio - Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.0] - 2026-10-25

### Added
- **Monorepo Architecture**:
  - Configured npm workspaces containing `packages/shared-types`, `packages/resume-schema`, `packages/template-registry`, `packages/resume-renderer`, `apps/api`, and `apps/web`.
  - Type-safe compilation pipelines with shared TypeScript configurations.

- **Authentication & Security Engine (`apps/api`)**:
  - Express.js backend with Helmet, CORS, Cookie-Parser, express-rate-limit, and Zod input validation.
  - Registration with cryptographic 6-digit email OTP verification delivered via Nodemailer (with local dev fallback).
  - SHA-256 hashed OTP challenges with 5-minute expiration, 5-attempt brute-force protection, and 60-second resend cooldowns.
  - Bcrypt password hashing and HttpOnly SameSite session cookies.
  - Complete Forgot Password recovery workflow with single-use challenge invalidation and session revocation.
  - Security audit logging for login, OTP, and password modification events.

- **Master Candidate Profile & Version Engine**:
  - Dynamic profile schema: Personal Details, Professional Summary, Work Experience with automated duration calculation, Education, Projects, 5-part categorized Skills (Technical, Job, Computer, Languages, Additional), Certifications, and optional Declaration.
  - Truthful Career Gap Assistant modal: detects gaps > 6 months, guides ethical explanations without fabrication, distinguishes between personal projects, freelance, family business, and caregiving.
  - Multi-version branching: candidates can create specialized resumes referencing the master profile without overwriting data.

- **15 ATS-Friendly Resume Templates (`packages/template-registry`)**:
  - 15 distinct, standards-compliant single-column ATS templates: Classic Professional, Modern Minimal, Corporate Standard, Technical Engineer, Software Developer, Fresher and Graduate, Experienced Professional, Career Change, Administrative and Office Support, Sales and Customer Service, Electrical and Instrumentation, Project-Focused, Skills-Focused, Academic Professional, General Purpose.
  - Lossless candidate data mapping engine: switching templates alters layout and section ordering dynamically without deleting data.

- **Responsive Next.js Frontend Studio (`apps/web`)**:
  - Next.js 14 App Router with Tailwind CSS, custom design tokens, and BEM component architecture.
  - Responsive 3-pane document studio (Section Editor | Live A4 Canvas Preview | Design & Spacing Controls).
  - Mobile mode switcher (Edit / Preview / Design) optimized for 320px–480px touch devices.
  - Live A4 physical layout renderer with dynamic zoom, automatic page balancing height calculations, and orphan heading warning triggers.
  - PWA Web App Manifest (`manifest.json`) and offline synchronization banner for local draft resilience.

- **AI Optimization & Usage Governance**:
  - Official Google Gemini AI (`@google/generative-ai`) integration with exponential backoff, jitter, and strict anti-hallucination guardrails.
  - Job Description (JD) Alignment Studio with requirement extraction and 4-tier Requirement Matrix (Supported, Partially Supported, Needs Confirmation, Not Found).
  - AI Usage Governance dashboard: real-time tracking of input tokens, output tokens, latency, cost calculations, and feature breakdowns.

- **Multi-Format Export Engine (`packages/resume-renderer`)**:
  - Native editable Microsoft Word (.docx) generator with standard heading hierarchies, real bullet lists, and calibrated margins.
  - Clean selectable-text PDF generation with A4 physical dimensions and Roboto font family.

- **Verification & Testing**:
  - Automated Vitest test suite (`apps/api/tests/unit.test.ts`) verifying registration schemas, OTP hashing, 15 template registry completeness, lossless data mapping, and A4 page balancing mathematics.
  - Complete end-to-end browser subagent run verifying user registration, OTP email verification, candidate profile creation, Career Gap Assistant, 3-pane editor, A4 page balancing, template switching, Word & PDF exports, JD tailor analysis, and AI token accounting.
  - Full demo video artifact recorded: `studio_full_demo_1792942420067.webp`.

