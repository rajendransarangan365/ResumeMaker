# ATS Resume Intelligence Studio

A full-stack enterprise-grade resume platform designed for high-fidelity resume extraction, structured candidate profile management, truthful AI-assisted content optimization via Google Gemini, ATS-compliant templating, live A4 document preview, and multi-format export (PDF and DOCX).

Built with **Next.js (App Router)**, **Express.js**, **MongoDB**, **Tailwind CSS**, and the official **Google GenAI SDK**.

---

## Key Capabilities

- **15 Production ATS Templates**: Standard single-column ATS layouts with clean heading tags, selectable text, and zero loss of candidate data when switching styles.
- **Truthful AI Guardrails**: Powered by Google Gemini (`@google/genai`). Never hallucinates employers, dates, or credentials. Highlights missing requirements rather than inventing skills.
- **Truthful Career Gap Assistant**: Detects intervals between employment records and assists with ethical presentation (freelance work, personal projects, certifications, or formal career breaks).
- **Physical A4 Page Balancing**: Real-time layout engine measuring heading margins and line heights to eliminate orphan headings, split bullet points, and accidental blank pages.
- **Multi-Format Export**: Native editable Word (.docx) generation with authentic styles and selectable-text PDF rendering matching physical A4/Letter metrics.
- **Comprehensive Authentication & Security**: Argon2id/bcrypt password hashing, multi-factor email OTP via Nodemailer SMTP, HttpOnly session cookies, brute-force rate limiters, and complete audit logging.
- **Real-Time AI Usage Accounting**: Tracks input/output tokens, request duration, success/failure status, and estimated costs with configurable budget caps.
- **Offline & PWA Ready**: Installable on Android and desktop, with local draft persistence in IndexedDB and automatic synchronization upon reconnection.

---

## Monorepo Architecture

```
ats-resume-studio/
├── apps/
│   ├── web/                    # Next.js 14+ App Router Frontend (React, TypeScript, Tailwind CSS)
│   └── api/                    # Node.js Express Backend (TypeScript, MongoDB, Nodemailer, Gemini SDK)
├── packages/
│   ├── shared-types/           # Common TypeScript types, DTOs, and interface definitions
│   ├── resume-schema/          # Zod validation schemas for resumes, profiles, and parsing
│   ├── template-registry/      # Metadata, styling tokens, and layout configs for 15 ATS templates
│   └── resume-renderer/        # Document layout calculation, page-balancing, DOCX & PDF generators
├── docs/                       # Technical guides, architecture diagrams, and testing matrices
├── scripts/                    # Build, migration, backup, and health check scripts
├── .env.example                # Centralized environment variable blueprint
└── README.md
```

---

## Quick Start Guide

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **MongoDB**: Community Server 4.4+ running locally on port 27017 (or MongoDB Atlas connection string)
- **Git**: Installed and configured

### 2. Installation
```bash
# Clone and enter workspace
git clone <repo-url> "D:\Resume maker"
cd "D:\Resume maker"

# Install all monorepo dependencies
npm install
```

### 3. Environment Configuration
Copy `.env.example` to `apps/api/.env`:
```bash
cp .env.example apps/api/.env
```
Update `apps/api/.env` with your `GEMINI_API_KEY` and SMTP details if testing live email delivery.

### 4. Running Locally
```bash
# Build packages
npm run build

# Start API Backend (Port 5000)
npm run dev:api

# Start Web Frontend (Port 3000)
npm run dev:web
```

---

## Documentation Index
- [Architecture & System Design](file:///d:/Resume%20maker/ARCHITECTURE.md)
- [Functional & Non-Functional Requirements](file:///d:/Resume%20maker/REQUIREMENTS.md)
- [Security & Encryption Specification](file:///d:/Resume%20maker/SECURITY.md)
- [AI & Google Gemini Integration](file:///d:/Resume%20maker/AI.md)
- [REST API Specification](file:///d:/Resume%20maker/API_SPECIFICATION.md)
- [MongoDB Database Schema](file:///d:/Resume%20maker/DATABASE_SCHEMA.md)
- [Testing & Quality Assurance](file:///d:/Resume%20maker/TESTING.md)
- [Deployment & Operations Guide](file:///d:/Resume%20maker/DEPLOYMENT.md)
- [User & Admin Operational Instructions](file:///d:/Resume%20maker/INSTRUCTIONS.md)
- [Release Changelog](file:///d:/Resume%20maker/CHANGELOG.md)
