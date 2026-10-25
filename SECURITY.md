# ATS Resume Intelligence Studio - Security & Privacy Specification

## 1. Authentication & Session Architecture

### 1.1 Password Hashing
- Passwords are encrypted before database insertion using **bcrypt** with a minimum work factor of 12 salt rounds (or Argon2id).
- Plaintext passwords are never logged, cached, transmitted to third-party services, or stored in database fields or browser storage.
- Password change events automatically trigger session revocation across all active devices.

### 1.2 Multi-Factor Email OTP Security
- Email verification codes and password recovery codes are generated using Node.js `crypto.randomInt(100000, 999999)` ensuring cryptographically unpredictable 6-digit values.
- OTP values are **never stored as plaintext** in MongoDB. The backend stores a SHA-256 hash of the OTP alongside its expiration timestamp and attempt counter.
- **Expiration Policy**: OTP challenges expire strictly after 300 seconds (5 minutes).
- **Brute-Force Guard**: A hard limit of 5 failed verification attempts is enforced per challenge. Upon reaching the threshold, the challenge is immediately marked invalid.
- **Resend Cooldown**: A minimum cooldown of 60 seconds is enforced between resend requests to thwart email bombing.
- **Single-Use Enforcement**: Upon successful verification, the challenge is marked as consumed and invalidated for any subsequent requests.

### 1.3 Session & Cookie Architecture
- Authentication tokens (JWT / Session IDs) are issued strictly via `HttpOnly`, `Secure` (in production), `SameSite=Strict` HTTP response cookies.
- Long-lived session tokens are forbidden in browser `localStorage` or `sessionStorage` to eliminate cross-site scripting (XSS) token extraction vectors.
- A cryptographic signing secret (`SESSION_SECRET`) signs and verifies all issued session cookies.

---

## 2. API Key Protection & Third-Party Guardrails

### 2.1 Google Gemini AI Key Isolation
- `GEMINI_API_KEY` is strictly confined to the Express backend runtime environment.
- The Next.js frontend is prohibited from receiving, storing, or proxying the Gemini API key.
- All AI operations route through authenticated Express endpoints (`/api/v1/optimization/*`, `/api/v1/parsing/*`).

### 2.2 SMTP Credentials & Server-Side Nodemailer
- SMTP authentication details (`SMTP_USER`, `SMTP_PASS`, `SMTP_HOST`, `SMTP_PORT`) are server-only variables.
- Transporter configurations are validated at server startup without echoing credentials to console logs.
- In diagnostic endpoints, credentials and passwords are strictly masked.

---

## 3. Rate Limiting, Throttling & DDoS Defense

The Express backend implements tiered rate limiting via `express-rate-limit` and `express-slow-down`:

| Endpoint Pattern | Window | Max Requests | Violation Response |
| :--- | :--- | :--- | :--- |
| `/api/v1/auth/login` | 15 minutes | 5 attempts / IP | HTTP 429 Too Many Requests (Exponential delay) |
| `/api/v1/auth/register` | 60 minutes | 5 registrations / IP | HTTP 429 Too Many Requests |
| `/api/v1/auth/*-otp` | 15 minutes | 5 attempts / account | Challenge Invalidation & Temporary Freeze |
| `/api/v1/documents/upload`| 15 minutes | 10 uploads / user | HTTP 429 Too Many Requests |
| `/api/v1/optimization/*` | 60 minutes | Configured Daily Quota | HTTP 429 AI Quota Exceeded |
| Global API (`/api/v1/*`) | 15 minutes | 300 requests / IP | HTTP 429 Rate Limit Exceeded |

---

## 4. File Upload & Document Parsing Security

1. **Strict MIME & Extension Whitelist**: Only authenticated users may upload files with verified MIME types (`application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`, `image/jpeg`, `image/png`).
2. **File Size Enforcement**: Maximum payload size is enforced at both the HTTP server level and Multer middleware (default: 10 MB).
3. **Private Ephemeral Storage**: Uploaded files are stored in a non-public temporary directory (`./storage/temp/`) outside the web root. Files are removed immediately following text extraction.
4. **Prompt Injection Defense**: Text extracted from untrusted resumes or job descriptions is wrapped within structured XML delimiters and isolated from system instructions in AI prompts.

---

## 5. Secret Rotation & Key Lifecycle

1. **Gemini Key Rotation**: Update `GEMINI_API_KEY` in the server environment and trigger a zero-downtime service reload (`pm2 reload` or container restart). Existing user sessions remain unaffected.
2. **Session Secret Rotation**: Rotating `SESSION_SECRET` invalidates existing session cookies, prompting users to re-authenticate securely.
3. **SMTP Credential Rotation**: Update `SMTP_USER` and `SMTP_PASS` in environment variables; restart API server and execute email delivery verification tests.

---

## 6. Security Reporting & Vulnerability Disclosure

Vulnerabilities should be responsibly disclosed directly to the engineering team. Include step-by-step reproduction steps, attack vector analysis, and proposed remediation.
