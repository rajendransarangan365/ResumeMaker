# ATS Resume Intelligence Studio - Agentic AI Architecture & Knowledge Base

## 1. Google ADK Multi-Agent Architecture

The platform features an enterprise multi-agent architecture built in `apps/agents` using Python, FastAPI, and Google Agent Development Kit patterns, paired with high-performance TypeScript fallback services in `apps/api`.

```
apps/agents/app/
├── agents/
│   ├── base_agent.py               # Abstract lifecycle, telemetry, and step logging
│   ├── resume_intelligence.py      # Agent 1: Resume parsing & evidence extraction
│   ├── jd_intelligence.py          # Agent 2: JD taxonomy & seniority classification
│   ├── candidate_matcher.py        # Agent 3: Strict evidence-based tri-state matching
│   ├── resume_writer.py            # Agent 4: Zero-hallucination resume writer
│   ├── ats_optimizer.py            # Agent 5: Keyword density & ATS structure audit
│   ├── template_selector.py        # Agent 6: Safe selector across 30 registered templates
│   ├── resume_qa.py                # Agent 7: Factual consistency & page balance audit
│   └── evaluator.py                # Agent 8: Multi-metric rubric scorecard evaluator
├── providers/
│   ├── base.py                     # ModelProvider abstraction (6 required methods)
│   ├── ollama_provider.py          # 100% Free local inference (Llama 3.2, Mistral, Gemma 2)
│   ├── gemini_provider.py          # Google GenAI API provider (Gemini 2.5/1.5 Flash/Pro)
│   ├── fallback_provider.py        # 100% Offline deterministic rule-based engine
│   └── factory.py                  # Dynamic provider resolver with auto-resilience
├── retrieval/
│   └── knowledge_retriever.py      # Semantic vector & keyword retrieval across 20 Job Families
└── workflows/
    └── orchestrator.py             # Central Resume Orchestrator with bounded retry loops (max 2)
```

---

## 2. The 8 Specialized Agents

1. **Resume Intelligence Agent**:
   - Parses raw resume files (PDF, DOCX, TXT) into a typed Candidate Profile.
   - Strictly evidence-based: records exact textual excerpts and refuses to fabricate unmentioned degrees or employers.

2. **Job Description Intelligence Agent**:
   - Analyzes pasted or uploaded job descriptions against the 20 Job Families knowledge base.
   - Extracts mandatory vs preferred qualifications, technical tools, seniority level, and domain terminology.

3. **Candidate-Job Matching Agent**:
   - Computes a tri-state evidence matrix:
     - **Supported**: Exact or synonym match directly corroborated by candidate facts.
     - **Partially Supported**: Transferable conceptual alignment requiring candidate review.
     - **Missing**: Real eligibility gap. Never hides or invents missing credentials.

4. **Resume Writing Agent**:
   - Generates tailored headline, professional summary, and polished bullet points using STAR/CAR action verbs.
   - **Zero-Hallucination Guardrail**: Never manufactures fake percentage improvements or unverified dollar amounts.

5. **ATS Optimization Agent**:
   - Verifies standard section headings for parser compatibility.
   - Detects and trims keyword stuffing (flags keywords occurring > 6 times).
   - Verifies high-priority terminology placement in linear text streams.

6. **Template Selection Agent**:
   - Automatically recommends the optimal template from the **30 registered ATS templates** based on job family, seniority, and content volume.
   - Strictly constrained: can only select from verified, registered templates.

7. **Resume Quality Assurance Agent**:
   - Audits factual consistency (employer names, job titles, date formatting).
   - Detects missing mandatory sections and calculates page fit balance (1-page standard vs 2-page senior).

8. **Evaluation Agent**:
   - Computes an objective multi-dimensional rubric scorecard:
     - Target Role Alignment (Relevance %)
     - Factual Integrity (Zero-Hallucination verification)
     - ATS Readability & Parsing stream safety
     - Action Verb Strength Ratio (% of bullets starting with decisive verbs)
     - Metric Quantification Ratio (% of bullets with measurable outcomes)

---

## 3. Free & Local Model Strategy

The platform provides a pluggable `ModelProvider` interface with zero vendor lock-in:

### Required Provider Interface:
- `generate(prompt, system_instruction)`
- `generateStructured(prompt, schema, system_instruction)`
- `embed(texts)`
- `healthCheck()`
- `getModelInfo()`
- `estimateResourceRequirements()`

### Supported Execution Modes:
1. **Local Ollama Mode (Free, 100% Private)**:
   - Connects to local Ollama runtime on `http://localhost:11434`.
   - Supports open-weight models: `llama3.2` (3B/8B), `mistral` (7B), `gemma2` (9B), `qwen2.5`.
   - Hardware requirements: 8GB RAM for 3B models, 16GB RAM for 7B/8B models.
2. **Google Gemini Mode**:
   - Connects via official GenAI API with JSON schema enforcement.
   - Uses `gemini-2.5-flash` for high-speed completions (< 1.5s latency).
3. **Deterministic Fallback Mode (100% Offline, Zero Cost)**:
   - Operates with zero network and zero API keys.
   - Uses high-precision regex heuristics, keyword extraction, and rule-based matching.
   - Never fails and never hallucinates.

---

## 4. 20 Job Family Knowledge Base (`knowledge/job-families/`)

Standardized taxonomies covering 20 essential employment domains:
1. Software Development (`software-development.json`)
2. IT Infrastructure and Cloud (`it-infrastructure-cloud.json`)
3. Artificial Intelligence and Data (`ai-data.json`)
4. Cybersecurity (`cybersecurity.json`)
5. Sales and Business Development (`sales-business-dev.json`)
6. Marketing and Advertising (`marketing-advertising.json`)
7. Customer Service and Technical Support (`customer-service-support.json`)
8. Finance and Accounting (`finance-accounting.json`)
9. Banking and Insurance (`banking-insurance.json`)
10. Human Resources and Recruitment (`hr-recruitment.json`)
11. Administration and Office Management (`administration-office.json`)
12. Operations and Logistics (`operations-logistics.json`)
13. Retail and E-commerce (`retail-ecommerce.json`)
14. Healthcare and Medical Administration (`healthcare-medical.json`)
15. Engineering (`engineering.json`)
16. Manufacturing and Quality (`manufacturing-quality.json`)
17. Construction and Infrastructure (`construction-infrastructure.json`)
18. Education and Training (`education-training.json`)
19. Hospitality and Travel (`hospitality-travel.json`)
20. Project Management and Executive Leadership (`project-management-executive.json`)

---

## 5. 30 ATS-Tested Resume Templates (`packages/template-registry`)

1. `classic-professional` - Traditional single-column executive layout
2. `modern-minimal` - Ultra-clean typographic layout with generous whitespace
3. `corporate-standard` - Centered header format for finance and business
4. `technical-engineer` - High-density technical skills and systems layout
5. `software-developer` - Dedicated tech stacks, repositories, and projects
6. `fresher-graduate` - Academic capstones, honors, and coursework priority
7. `experienced-professional` - Trajectory-focused leadership format
8. `career-change` - Transferable skills and bridge project spotlight
9. `administrative-support` - Office tools, coordination, and clerical support
10. `sales-customer-service` - Quota attainments, revenue impact, and client relations
11. `electrical-instrumentation` - Technical trades, maintenance, and safety
12. `project-focused` - Delivered project scopes and technical outcomes
13. `skills-focused` - Functional 5-part skills matrix
14. `academic-professional` - Research publications and lecturing curriculum
15. `general-purpose` - Versatile balanced layout for all domains
16. `modern-single-column` - Sleek left-accented section headers
17. `minimal-professional` - High-density page optimizer with subtle rules
18. `corporate-professional` - Stately format for directors and consultants
19. `graduate-entry` - Academic foundations and internship focus
20. `technical-specialist` - Systems analysts, DBAs, and network engineers
21. `senior-engineer` - Architectural leadership and scale focus
22. `executive-leadership` - C-Suite, board governance, and P&L strategy
23. `marketing-professional` - Growth metrics, CAC/ROAS, and campaign wins
24. `customer-support` - CSAT/NPS velocity and ticketing operations
25. `finance-accounting` - GAAP/IFRS audits and ERP financial modeling
26. `healthcare-medical` - Nursing licenses, clinical acuity, and EHR mastery
27. `researcher-cv` - Peer-reviewed papers, lab grants, and symposiums
28. `employment-gap-friendly` - Functional hybrid highlighting acquired skills
29. `international-professional` - Multi-lingual and cross-border standards
30. `ats-focused-hybrid` - Optimized for maximum parsing across Workday/Taleo
