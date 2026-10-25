# ATS Resume Intelligence Studio - Development Roadmap

## Project Status: Active Development
Current Phase: Monorepo Setup, Core Foundation, & Architecture Landing

---

## Milestone 1: Core Foundation & Shared Architecture
- [x] Initial repository inspection and toolchain verification.
- [x] Comprehensive architectural documentation (ARCHITECTURE, REQUIREMENTS, SECURITY, AI, etc.).
- [x] Monorepo workspace configuration (`apps/web`, `apps/api`, `packages/shared-types`, `packages/resume-schema`, `packages/template-registry`, `packages/resume-renderer`).
- [x] Environment variable schema definition and validation module.
- [ ] Shared type packages and Zod validation schemas (`packages/shared-types`, `packages/resume-schema`).
- [ ] Status: **In Progress**

---

## Milestone 2: Express Backend, Database & Secure Authentication
- [ ] MongoDB connection manager and Mongoose schema definitions (`User`, `AuthChallenge`, `CandidateProfile`, `ResumeVersion`, `AIUsageLog`, `SecurityAuditLog`).
- [ ] Nodemailer SMTP integration with HTML email templates (Email Verification, Password Recovery).
- [ ] Secure authentication endpoints (`/register`, `/verify-email`, `/login`, `/logout`, `/forgot-password`, `/reset-password`).
- [ ] Security middleware (Helmet, CORS, Rate Limiters, HttpOnly Session Cookie authentication).
- [ ] Unit & integration test suite for authentication flows.
- [ ] Status: **Not Started**

---

## Milestone 3: Candidate Profile & Resume Version Engine
- [ ] Master candidate profile CRUD endpoints and validation.
- [ ] Multi-version resume branching engine.
- [ ] Truthful Career Gap Assistant (detection of gaps, ethical guidance, zero hallucination).
- [ ] Uncategorized information buffer and conflict resolution.
- [ ] Status: **Not Started**

---

## Milestone 4: Template Registry & 15 ATS-Friendly Templates
- [ ] Template registry architecture with standardized data-mapping interfaces.
- [ ] Implementation of 15 distinct ATS-friendly templates:
  1. Classic Professional
  2. Modern Minimal
  3. Corporate Standard
  4. Technical Engineer
  5. Software Developer
  6. Fresher and Graduate
  7. Experienced Professional
  8. Career Change
  9. Administrative and Office Support
  10. Sales and Customer Service
  11. Electrical and Instrumentation
  12. Project-Focused
  13. Skills-Focused
  14. Academic Professional
  15. General Purpose
- [ ] Dynamic section ordering and graceful omission of empty fields.
- [ ] Status: **Not Started**

---

## Milestone 5: Next.js Frontend & Responsive Studio Editor
- [ ] Next.js 14+ App Router setup with Tailwind CSS and BEM class design tokens.
- [ ] Public landing page, authentication views (Sign-in, Register, OTP Verification, Password Recovery).
- [ ] Application shell: Responsive navigation, collapsible desktop sidebars, mobile bottom navigation.
- [ ] Candidate Profile manager with dynamic repeatable forms (Education, Experience, Projects, 5-part Skills).
- [ ] Responsive 3-pane resume editor (Editor | Live Preview | Design Controls) with mobile Mode Switcher (Edit, Preview, Design).
- [ ] Live A4/Letter document preview with scaling and automatic page balancing alerts.
- [ ] Status: **Not Started**

---

## Milestone 6: Document Parsing & Ingestion Pipeline
- [ ] Multi-format upload handler (PDF, DOCX, TXT, Images).
- [ ] Server-side text extraction engine (`pdf-parse`, `mammoth`).
- [ ] Gemini AI structured extraction pipeline mapping raw text to candidate schema with confidence tagging.
- [ ] Interactive review interface for extracted information.
- [ ] Status: **Not Started**

---

## Milestone 7: Gemini AI Optimization & Usage Monitoring
- [ ] Official `@google/genai` integration with bounded retries and exponential backoff with jitter.
- [ ] General Resume Mode & Job Description (JD) Specific Mode with Requirement Matrix.
- [ ] AI Usage Monitoring dashboard (requests, token metrics, cost estimations, real data logs).
- [ ] Server-side rate limit and budget enforcement.
- [ ] Status: **Not Started**

---

## Milestone 8: Multi-Format Document Export (PDF & DOCX)
- [ ] Server-side selectable-text PDF rendering engine with exact A4 physical margins and Roboto fonts.
- [ ] Native editable DOCX export engine using `docx` with authentic Word styles and lists.
- [ ] Visual and metric export validation.
- [ ] Status: **Not Started**

---

## Milestone 9: PWA, Offline Capability & Standalone Deployment
- [ ] Service worker and Web App Manifest for mobile and desktop installability.
- [ ] IndexedDB local storage and draft synchronization queue.
- [ ] Standalone PC and Android execution documentation and configuration.
- [ ] Status: **Not Started**

---

## Milestone 10: End-to-End Testing & Hardening
- [ ] Automated Jest/Supertest suite for API endpoints.
- [ ] Frontend form validation, responsive viewport checks (320px - 1440px), and accessibility tests.
- [ ] Final deployment verification and release packaging.
- [ ] Status: **Not Started**
