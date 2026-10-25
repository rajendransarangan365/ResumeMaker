# ATS Resume Intelligence Studio - Testing Strategy & Test Plan

## 1. Overview
This document specifies automated and manual testing procedures to guarantee high availability, strict security enforcement, responsive UI fidelity across viewports, document export precision, and resilient AI error handling.

---

## 2. Test Pyramid & Tooling

```
      / \
     / E2E \       Playwright / Browser Subagent
    /-------\
   / Integ.  \     Supertest, Jest, MongoDB In-Memory / Test DB
  /-----------\
 /  Unit Tests \   Jest / Vitest, React Testing Library
/---------------\
```

| Scope | Tool | Target Areas |
| :--- | :--- | :--- |
| **Unit Testing** | Vitest / Jest | Zod schemas, data normalization, duration calculators, template data mappers, token cost counters, A4 page balancing math. |
| **Backend Integration** | Supertest | Auth routes (OTP, registration, login), session cookies, rate limiting, candidate profile CRUD, export routes. |
| **Frontend Component** | Vitest + React Testing Library | Form validation errors, dynamic section additions/removals, template switcher, mobile drawer navigation. |
| **End-to-End Workflow** | Playwright / Browser Agent | User registration -> OTP verification -> resume creation -> template selection -> live preview -> PDF & DOCX export. |

---

## 3. Mandatory Test Scenarios

### 3.1 Authentication & Security Matrix
- [ ] **TC-AUTH-01**: Registration succeeds with valid data; dispatches 6-digit OTP email.
- [ ] **TC-AUTH-02**: Duplicate email registration fails safely without account enumeration.
- [ ] **TC-AUTH-03**: Submitting valid OTP activates account and issues `HttpOnly` cookie.
- [ ] **TC-AUTH-04**: Submitting invalid OTP increments attempt counter; rejects attempt.
- [ ] **TC-AUTH-05**: Reaching 5 invalid OTP attempts permanently invalidates the challenge.
- [ ] **TC-AUTH-06**: Resending OTP before 60 seconds returns HTTP 429 cooldown error.
- [ ] **TC-AUTH-07**: Login with incorrect password triggers rate limiter after 5 attempts.
- [ ] **TC-AUTH-08**: Password reset invalidates active session tokens.
- [ ] **TC-AUTH-09**: Unauthenticated requests to `/api/v1/profiles` and `/api/v1/resumes` return HTTP 401.
- [ ] **TC-AUTH-10**: User A cannot view, modify, or export User B's resumes or candidate profile (HTTP 403/404).

### 3.2 Candidate Profile & Template Mapping
- [ ] **TC-PROF-01**: Dynamic addition and removal of experience, education, and project entries.
- [ ] **TC-PROF-02**: Automatic calculation of employment durations (e.g., "Jan 2021 – Mar 2023" -> "2 yrs 3 mos").
- [ ] **TC-PROF-03**: Truthful Career Gap Assistant identifies intervals > 6 months and offers ethical framing prompts.
- [ ] **TC-TMPL-01**: Switching between all 15 ATS templates retains 100% of candidate data without data loss or corruption.
- [ ] **TC-TMPL-02**: Empty sections or optional omitted fields render clean output without "null", "undefined", or blank lines.

### 3.3 Physical A4 Document & Export Quality
- [ ] **TC-DOC-01**: Live preview renders exact A4 proportions (210mm x 297mm).
- [ ] **TC-DOC-02**: Page balancing engine flags orphan headings and multi-page content overflow.
- [ ] **TC-DOC-03**: PDF export generates valid binary PDF with selectable text, correct page count, and embedded Roboto fonts.
- [ ] **TC-DOC-04**: DOCX export generates valid editable Office Open XML document with true heading hierarchy and native bullet lists.

### 3.4 AI Guardrails & Usage Metering
- [ ] **TC-AI-01**: AI optimizations operate strictly on candidate-provided facts without inventing credentials.
- [ ] **TC-AI-02**: Job Description matching correctly classifies unverified requirements as "Not Found" or "Needs Confirmation".
- [ ] **TC-AI-03**: Token usage and latency are accurately logged to `AIUsageLog` after each completion.
- [ ] **TC-AI-04**: Exponential backoff with jitter successfully retries transient rate-limit errors (HTTP 429).
- [ ] **TC-AI-05**: Exceeding daily user limits or monthly budget yields clear user-facing quota messages.

---

## 4. Responsive Viewport Test Suite

Every page and component must be validated across the following standard viewport dimensions:
- Small Phone: 320 x 568 px (iPhone SE legacy)
- Standard Phone: 375 x 667 px / 390 x 844 px (iPhone 12/13/14)
- Large Android Phone: 412 x 915 px (Pixel 7 / Galaxy S22)
- Tablet Portrait: 768 x 1024 px (iPad Mini / Surface Go)
- Tablet Landscape: 1024 x 768 px
- Laptop / Desktop: 1280 x 800 px / 1440 x 900 px
- High-Resolution Desktop: 1920 x 1080 px

**Viewport Verification Rules**:
1. Zero unintended horizontal scrollbars on viewports <= 768px.
2. Form input controls and action buttons maintain primary touch targets >= 44 x 44 px.
3. Mobile editor switches cleanly between "Edit", "Preview", and "Design" modes.
