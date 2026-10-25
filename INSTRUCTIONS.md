# ATS Resume Intelligence Studio - Operational Instructions

Welcome to **ATS Resume Intelligence Studio**. This guide walks through user workflows, administrator tasks, and system operations.

---

## 1. User Workflows

### 1.1 Account Registration & Email Verification
1. Navigate to `/register`.
2. Fill in your **Full Name**, **Email Address**, and choose a strong **Password** (min 8 chars, mixed case, numbers, special characters).
3. Read and agree to the Terms of Service & Privacy Policy.
4. Click **Create Account**. A 6-digit OTP will be dispatched to your email address via Nodemailer SMTP.
5. On the `/verify-email` screen, enter the 6-digit code.
   - If code has not arrived, wait 60 seconds for the **Resend Code** countdown to expire.
   - You have up to 5 attempts before the challenge expires.
6. Once verified, your account is activated and you will be directed to your **Dashboard**.

### 1.2 Creating a Resume Manually
1. From the Dashboard, click **New Resume** -> **Create Manually**.
2. Enter or edit your **Personal Details** (Name, headline, contact info, links).
3. Populate **Work Experience**, **Education**, **Projects**, and **Skills** (5 distinct categories: Technical, Job, Computer, Languages, Additional).
4. Review the **Truthful Career Gap Assistant**: If the system detects gaps greater than 6 months between jobs, select whether you engaged in freelance work, certifications, personal projects, or had a career break.
5. Select an ATS-compliant template from the **Template Gallery** (15 available templates).
6. Inspect the live document preview in real-time. Use zoom controls or A4 page balance warnings to adjust spacing.
7. Click **Export** and choose either **Selectable PDF** or **Editable Word (DOCX)**.

### 1.3 Importing an Existing Resume
1. Click **Import Resume** from the Dashboard or navigation bar.
2. Drag and drop your file (PDF, DOCX, TXT, or Image).
3. The server extracts the text and uses Google Gemini to classify your background into structured fields.
4. On the **Parsing Review Interface**:
   - Fields will show status badges: `Extracted`, `Needs Review`, `Missing`.
   - Inspect unmapped text in the **Uncategorized Information** area.
   - Resolve any detected data conflicts (e.g., dual phone numbers or overlapping dates).
5. Click **Confirm & Save to Master Profile**.

### 1.4 Tailoring a Resume to a Job Description (JD Mode)
1. In the Resume Editor, switch to **Job Description Mode**.
2. Paste the employer's Job Description or upload the vacancy document.
3. Click **Analyze Job Requirements**. The AI extracts required qualifications, technical skills, and responsibilities.
4. Review the **Requirement Matrix**:
   - `Supported`: Skills corroborated by your verified profile.
   - `Partially Supported`: Relevant experience exists; review suggested alignment.
   - `Not Found`: Highlights missing keywords so you can truthfully add them if applicable, without hallucinating fake experience.
5. Generate an optimized professional summary and bullet points emphasizing verified achievements.
6. Export the targeted resume.

---

## 2. Password Recovery (Forgot Password)
1. On `/login`, click **Forgot Password?**.
2. Enter your registered email address and submit.
3. Check your email for the 6-digit recovery OTP.
4. Submit the OTP on `/verify-reset-otp`.
5. Enter and confirm your new password on `/reset-password`.
6. Upon reset, all previous active sessions will be terminated. Log in with your new password.

---

## 3. Offline Mode & PWA Usage
- You can install the application on Android, Windows, or macOS using Chrome / Edge.
- When working offline, an **Offline** badge appears.
- All manual edits, new resume drafts, and profile updates are stored locally in **IndexedDB**.
- AI features (parsing, optimization) are gracefully paused while disconnected.
- When internet connectivity is restored, drafts synchronize automatically with the server.

---

## 4. Administrative Operations & AI Governance
1. Log in with an administrator account and navigate to `/admin/ai-usage`.
2. Inspect real-time metrics:
   - Daily request volume vs configured limits.
   - Token consumption by feature and model (`gemini-2.5-flash`).
   - Monthly expenditure vs application budget caps.
3. Review audit logs for suspicious login attempts or rate-limit violations.
