# ATS Resume Intelligence Studio - API Specification

Base URL: `http://localhost:5000/api/v1`

All responses follow standard JSON envelopes:
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```
Error Envelope:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address format",
    "details": []
  }
}
```

---

## 1. Authentication & Account Management (`/auth`)

### `POST /auth/register`
Creates an unverified user account and dispatches email verification OTP via Nodemailer.
- **Request Body**:
  ```json
  {
    "fullName": "Jane Doe",
    "email": "jane@example.com",
    "password": "SecurePassword123!",
    "confirmPassword": "SecurePassword123!",
    "termsAccepted": true
  }
  ```
- **Response**: `201 Created`
  ```json
  { "success": true, "message": "Verification code sent to email." }
  ```

### `POST /auth/verify-email`
Validates the 6-digit OTP and activates the user account.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "otp": "492018"
  }
  ```
- **Response**: `200 OK` (Sets session cookie and returns user object)

### `POST /auth/resend-verification`
Issues a new OTP after validating the 60-second resend cooldown.
- **Request Body**: `{ "email": "jane@example.com" }`
- **Response**: `200 OK`

### `POST /auth/login`
Authenticates credentials and establishes a signed HttpOnly session cookie.
- **Request Body**:
  ```json
  {
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Response**: `200 OK`

### `POST /auth/logout`
Clears session cookie and invalidates server-side session.
- **Response**: `200 OK`

### `POST /auth/forgot-password`
Initiates password recovery OTP dispatch.
- **Request Body**: `{ "email": "jane@example.com" }`
- **Response**: `200 OK` ("If an account exists, recovery instructions have been sent.")

### `POST /auth/verify-reset-otp`
Validates recovery OTP and returns a single-use password reset challenge token.
- **Request Body**: `{ "email": "jane@example.com", "otp": "918234" }`
- **Response**: `200 OK` with `resetToken`

### `POST /auth/reset-password`
Completes password change using the reset token.
- **Request Body**:
  ```json
  {
    "resetToken": "...",
    "newPassword": "NewSecurePassword456!",
    "confirmNewPassword": "NewSecurePassword456!"
  }
  ```
- **Response**: `200 OK`

### `GET /auth/me`
Returns current authenticated user session details.
- **Response**: `200 OK` with user profile

---

## 2. Candidate Profiles (`/profiles`)

### `GET /profiles`
Fetches candidate profiles owned by the authenticated user.
- **Response**: `200 OK` with array of profiles

### `POST /profiles`
Creates a master candidate profile.
- **Request Body**: Validated candidate profile schema (Personal details, education, experience, projects, skills).
- **Response**: `201 Created`

### `GET /profiles/:profileId`
Fetches full details of a candidate profile.
- **Response**: `200 OK`

### `PATCH /profiles/:profileId`
Updates candidate profile fields.
- **Response**: `200 OK`

---

## 3. Resume Versions (`/resumes`)

### `GET /resumes`
Lists all resume versions owned by the authenticated user.
- **Response**: `200 OK`

### `POST /resumes`
Creates a new resume version from a master profile or custom inputs.
- **Request Body**:
  ```json
  {
    "candidateProfileId": "65b...",
    "title": "Senior Frontend Engineer Resume",
    "templateId": "classic-professional",
    "targetJobTitle": "Staff Software Engineer",
    "sectionOrder": ["summary", "skills", "experience", "projects", "education"],
    "formatting": {
      "pageSize": "A4",
      "fontFamily": "Roboto",
      "fontSizePt": 10,
      "marginsMm": 15
    }
  }
  ```
- **Response**: `201 Created`

### `GET /resumes/:resumeId`
Fetches full resume version state.
- **Response**: `200 OK`

### `PATCH /resumes/:resumeId`
Updates resume version content, template selection, or formatting options.
- **Response**: `200 OK`

### `POST /resumes/:resumeId/duplicate`
Duplicates a resume version with a new title.
- **Response**: `201 Created`

### `DELETE /resumes/:resumeId`
Soft-deletes or removes a resume version.
- **Response**: `200 OK`

---

## 4. Document Upload & Parsing (`/documents`, `/parsing`)

### `POST /documents/upload`
Uploads a resume file (multipart/form-data).
- **Form Data**: `file` (PDF, DOCX, TXT, Image)
- **Response**: `201 Created` with `documentId` and extracted metadata

### `POST /parsing/:documentId`
Triggers multi-stage AI extraction and returns parsed candidate structure.
- **Response**: `200 OK` with structured fields, confidence scores, and unmapped text

---

## 5. Job Description & Optimization (`/job-descriptions`, `/optimization`)

### `POST /job-descriptions/analyze`
Extracts requirements, technical skills, and responsibilities from a job description.
- **Request Body**: `{ "text": "...", "jobTitle": "...", "company": "..." }`
- **Response**: `200 OK`

### `POST /optimization/match`
Evaluates candidate profile against parsed job description requirements.
- **Request Body**: `{ "profileId": "...", "jobDescriptionId": "..." }`
- **Response**: `200 OK` with Requirement Matrix and keyword coverage report

### `POST /optimization/optimize-bullet`
Refines an individual experience or project bullet point using strong action verbs and quantified impact.
- **Request Body**: `{ "originalText": "...", "targetRole": "..." }`
- **Response**: `200 OK` with suggested revisions

---

## 6. Document Export (`/exports`)

### `POST /exports/pdf`
Renders resume to physical A4/Letter selectable-text PDF.
- **Request Body**: `{ "resumeId": "..." }`
- **Response**: `application/pdf` binary stream with `Content-Disposition: attachment; filename="resume.pdf"`

### `POST /exports/docx`
Renders resume to native editable Word document (.docx).
- **Request Body**: `{ "resumeId": "..." }`
- **Response**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` binary stream

---

## 7. AI Usage & Health (`/ai-usage`, `/health`)

### `GET /ai-usage/summary`
Returns user or administrative AI consumption metrics (token counts, request volume, estimated cost).
- **Response**: `200 OK`

### `GET /health`
System operational status check (MongoDB connection, uptime, memory, version).
- **Response**: `200 OK`
