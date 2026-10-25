# ATS Resume Intelligence Studio - System Requirements

## 1. Functional Requirements

### 1.1 Authentication & User Management
- **FR-AUTH-01**: User registration with Full Name, Email, Password, and Password Confirmation.
- **FR-AUTH-02**: Email normalization and duplicate account detection without user enumeration.
- **FR-AUTH-03**: Password hashing using bcrypt with salt rounds >= 12 or Argon2id.
- **FR-AUTH-04**: Account created in unverified state pending 6-digit cryptographic OTP confirmation.
- **FR-AUTH-05**: Nodemailer SMTP integration for delivering verification OTP and notification emails.
- **FR-AUTH-06**: OTP verification screen with countdown timer (300 seconds), resend cooldown (60 seconds), and maximum attempt limit (5 attempts).
- **FR-AUTH-07**: Login with email and password, secure HttpOnly cookie session management, and brute-force throttling.
- **FR-AUTH-08**: Forgot Password recovery workflow with 6-digit OTP, attempt limits, and single-use challenge expiration.
- **FR-AUTH-09**: Optional security questions as secondary recovery, stored using one-way hashes.
- **FR-AUTH-10**: Session revocation upon password reset and explicit "Logout from all devices" capability.
- **FR-AUTH-11**: Security audit logging for authentication events (login, failed attempt, verification, password change).

### 1.2 Candidate Profile Management
- **FR-PROF-01**: Master candidate profile supporting comprehensive personal details (Name, Contact, Headline, Residential Address, Preferred Locations, Social/Portfolio URLs).
- **FR-PROF-02**: Professional summary with manual editing and AI optimization.
- **FR-PROF-03**: Education history with qualification, specialization, institution, dates, grade/CGPA, academic achievements, and optional inclusion flag.
- **FR-PROF-04**: Work experience with employer, title, dates, employment type, location, responsibilities, technologies, achievements, and automatic duration calculation.
- **FR-PROF-05**: Projects section categorized into Academic and Professional projects with technology stacks, deliverables, and URLs.
- **FR-PROF-06**: 5 distinct skill categories: Technical Skills, Job Skills, Computer Skills, Languages, and Additional Skills.
- **FR-PROF-07**: Business experience and Current Occupation status indicators.
- **FR-PROF-08**: Optional and editable formal Declaration section.
- **FR-PROF-09**: Truthful Career Gap Assistant detecting employment date intervals and guiding legitimate documentation (freelance, training, career break) without fabricating history.
- **FR-PROF-10**: Support for extensible custom sections (Certifications, Publications, Awards, Volunteering).

### 1.3 Resume Versions & Multi-Mode Studio
- **FR-VERS-01**: Creation of multiple resume versions branching from a single master profile without duplicating profile records.
- **FR-VERS-02**: General Resume Mode targeting specific industry tracks (Engineering, IT, Finance, Healthcare, Sales, etc.) or general employment.
- **FR-VERS-03**: Job-Description (JD) Mode:
  - Ingestion of job descriptions (paste or file upload).
  - Extraction of job title, mandatory qualifications, preferred skills, tools, and responsibilities.
  - Requirement Matrix mapping: Supported, Partially Supported, Needs Confirmation, Not Found.
  - Keyword coverage scoring and truthful alignment suggestions.

### 1.4 Document Ingestion & Parsing
- **FR-DOC-01**: Ingestion of PDF, DOCX, DOC, TXT, RTF, ODT, and Image formats (JPEG, PNG).
- **FR-DOC-02**: Multi-stage parsing pipeline: Upload -> Validation -> Text Extraction -> AI Classification -> Field Mapping.
- **FR-DOC-03**: Field-level source confidence tracking (Extracted, Verified, Needs Review, Missing, Not Applicable).
- **FR-DOC-04**: Preservation of all unmapped text in an editable "Uncategorized Information" buffer.
- **FR-DOC-05**: Conflict detection and interactive resolution for contradictory data points (e.g., conflicting phone numbers or graduation years).

### 1.5 ATS-Friendly Template System
- **FR-TMPL-01**: Implementation of 15 distinct, verified ATS-friendly templates:
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
- **FR-TMPL-02**: Common normalized data binding across all templates—switching templates preserves 100% of candidate data.
- **FR-TMPL-03**: Configurable section ordering and visibility toggles per template.
- **FR-TMPL-04**: Graceful omission of empty fields (no "null", "undefined", or blank placeholder artifacts).
- **FR-TMPL-05**: ATS design compliance: single-column default flow, standard heading tags, selectable text, and zero reliance on non-extractable graphics.

### 1.6 Document Preview & Page Layout Management
- **FR-PREV-01**: Responsive 3-pane layout for desktop (Editor | Live Preview | Style Controls) with collapsible side panels.
- **FR-PREV-02**: Responsive mobile-first interface with Mode Switcher (Edit, Preview, Design) and touch-friendly controls (>= 44x44px).
- **FR-PREV-03**: Physical A4 and US Letter page dimension rendering with real-time zoom controls (50%, 75%, 100%, 125%, Fit-to-Width).
- **FR-PREV-04**: Automatic page balancing engine detecting content overflow, orphaned headings, and split bullet points.

### 1.7 Multi-Format Export
- **FR-EXP-01**: Selectable-text PDF export with exact physical page margins, embedded typography (Roboto / Inter), and accurate page breaks.
- **FR-EXP-02**: Fully editable Word DOCX export utilizing standard Word heading styles, true bullet lists, and native table formatting.

### 1.8 Gemini AI Integration & Usage Governance
- **FR-AI-01**: Server-side execution via official Google GenAI SDK (`@google/genai`).
- **FR-AI-02**: Anti-hallucination guardrails: AI operates exclusively on candidate-provided evidence and never invents employers, dates, or credentials.
- **FR-AI-03**: Comprehensive usage metering: Request Count, Input Tokens, Output Tokens, Cached Tokens, Latency, and Estimated Cost.
- **FR-AI-04**: Real-time analytics dashboard with temporal filtering (Today, This Month, All Time) displaying actual logged metrics.
- **FR-AI-05**: Server-enforced daily user request quotas and monthly application budget limits.

### 1.9 Offline & Standalone Operations
- **FR-OFF-01**: Progressive Web App (PWA) manifest and Service Worker caching app shell and static resources.
- **FR-OFF-02**: Client-side draft persistence via IndexedDB for offline resume editing.
- **FR-OFF-03**: Clear UI indicators for online/offline status with graceful disabling of AI-dependent actions when disconnected.
- **FR-OFF-04**: Automatic synchronization queue reconciling local drafts upon network reconnection.

---

## 2. Non-Functional Requirements

- **NFR-SEC-01**: Zero secrets in client-side bundles; all sensitive configurations stored in server environment variables.
- **NFR-SEC-02**: HTTPS enforcement in production with HSTS, CSP, and secure cookie headers.
- **NFR-PERF-01**: Resume preview render latency < 150ms on standard edits.
- **NFR-PERF-02**: PDF generation completion < 2.5s for multi-page documents.
- **NFR-RESP-01**: Zero horizontal scrolling on standard phone viewports (320px - 479px).
- **NFR-A11Y-01**: WCAG 2.1 AA compliance across all form controls, interactive buttons, and preview interfaces.
- **NFR-DATA-01**: Tenant data isolation ensuring users cannot access or query foreign resumes or uploaded files.
