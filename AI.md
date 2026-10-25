# ATS Resume Intelligence Studio - AI & Gemini Integration Architecture

## 1. Google Gemini AI Architecture

The platform utilizes Google's official GenAI SDK (`@google/genai`) exclusively within the Express.js backend layer. The client never interacts directly with Gemini or holds API tokens.

### 1.1 Configured Models
- **Primary Workhorse**: `gemini-2.5-flash` (or `gemini-1.5-flash` / user configurable via `GEMINI_MODEL`). Offers optimal latency (< 1.5s), large token context, high JSON-mode fidelity, and cost efficiency.
- **Deep Reasoning / Complex Ingestion**: `gemini-2.5-pro` (or `gemini-1.5-pro` / configurable) for complex scanned multi-page resumes requiring advanced spatial layout comprehension.

---

## 2. Core AI Services & Modules

```
apps/api/src/services/ai/
├── gemini.client.ts            # Singleton SDK instance with backoff and retry decorators
├── resume-parser.ai.ts         # Unstructured text to strict JSON candidate profile extraction
├── summary-generator.ai.ts     # Truthful professional summary tailoring
├── jd-analyzer.ai.ts           # Job description requirement and skill extraction
├── candidate-matcher.ai.ts     # Requirement vs Candidate evidence matrix generation
├── resume-optimizer.ai.ts      # ATS bullet point enhancement with metrics and impact verbs
├── career-gap.ai.ts            # Truthful career gap analysis & framing assistant
└── ats-evaluator.ai.ts         # ATS readability, formatting, and keyword density score
```

---

## 3. Strict Anti-Hallucination Guardrails

AI services operate under strict behavioral constraints to ensure candidate integrity:

1. **Evidence-Based Extraction Only**: The AI must extract only facts explicitly attested to in the uploaded document or user input. It is strictly forbidden from inferring degrees, unmentioned employers, fabricated job dates, or unstated technologies.
2. **Job Description is a Requirement, Not Evidence**: A skill required by a job description must NEVER be injected into the candidate's verified profile unless the candidate's existing background substantiates it.
3. **Tri-State Match Classification**:
   - **Supported**: Directly corroborated by candidate experience or education.
   - **Partially Supported**: Related conceptual skills present, but requires user validation.
   - **Not Found**: Requirement is absent from candidate background. The platform alerts the candidate rather than inventing qualifications.
4. **Structured JSON Schema Enforcement**: All model completions use `responseMimeType: "application/json"` with comprehensive JSON Schemas to guarantee type-safe outputs validated at runtime with Zod.

---

## 4. Usage Monitoring & Token Accounting

Every interaction with Gemini is metered and persisted to the `AIUsageLogs` MongoDB collection:

```typescript
interface IAIUsageLog {
  userId: string;
  feature: 'parsing' | 'summary' | 'jd_match' | 'optimization' | 'career_gap' | 'ats_eval';
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  durationMs: number;
  success: boolean;
  errorCategory?: string;
  estimatedCostUsd: number;
  createdAt: Date;
}
```

### 4.1 Cost Calculation Matrix
Costs are computed using date-stamped rate configurations per million tokens:
- **Flash Models**:
  - Input: $0.075 / 1M tokens ($0.000000075 / token)
  - Output: $0.300 / 1M tokens ($0.0000003 / token)
- **Pro Models**:
  - Input: $1.250 / 1M tokens ($0.00000125 / token)
  - Output: $5.000 / 1M tokens ($0.000005 / token)

### 4.2 Rate Limiting & Backoff Algorithm
- All Gemini calls pass through a resilient execution wrapper implementing **exponential backoff with jitter**:
  - Initial delay: 1000ms
  - Multiplier: 2x
  - Max retries: 3 attempts
  - Jitter: ±20% randomized interval
- If quota limits (`RESOURCE_EXHAUSTED` / HTTP 429) persist after retries, the service returns a graceful failure payload allowing user fallback to manual editing.
