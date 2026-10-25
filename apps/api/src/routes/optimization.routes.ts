import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini.service';
import { CandidateProfile } from '../models/CandidateProfile';
import { JobDescriptionInputSchema } from '@ats/resume-schema';
import { validateBody } from '../middleware/validate.middleware';
import { IRequirementMatch, MatchStatus } from '@ats/shared-types';

const router = Router();

// POST /api/v1/optimization/analyze-jd
router.post(
  '/analyze-jd',
  requireAuth,
  validateBody(JobDescriptionInputSchema),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobTitle, companyName, rawText } = req.body;

      const systemPrompt = `
You are an expert ATS Job Description Analyzer.
Extract key requirements from the provided job description text.
RULES:
1. Do not invent requirements that are not in the text.
2. Group skills logically into technical skills and software tools.
Output strictly valid JSON:
{
  "jobTitle": string,
  "requiredQualifications": string[],
  "requiredExperienceYears": number,
  "technicalSkills": string[],
  "softwareTools": string[],
  "responsibilities": string[],
  "softSkills": string[]
}
      `.trim();

      const userPrompt = `Job Title: ${jobTitle}\nCompany: ${companyName}\n\nJob Description:\n${rawText}`;

      const heuristicFallback = () => ({
        jobTitle,
        requiredQualifications: ["Bachelor's degree or equivalent practical experience"],
        requiredExperienceYears: 3,
        technicalSkills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'REST APIs'],
        softwareTools: ['Git', 'Docker', 'AWS'],
        responsibilities: [
          'Develop and maintain scalable web applications and microservices.',
          'Collaborate with product designers and engineering teams.',
        ],
        softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
      });

      const analysis = await geminiService.executeStructuredPrompt(
        req.user!._id.toString(),
        'jd_analysis',
        systemPrompt,
        userPrompt,
        heuristicFallback
      );

      res.status(200).json({
        success: true,
        data: { analysis },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/optimization/match-jd
router.post(
  '/match-jd',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobDescriptionText, jobTitle } = req.body;

      const profile = await CandidateProfile.findOne({ userId: req.user!._id });
      if (!profile) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
        return;
      }

      const systemPrompt = `
You are an objective ATS Candidate Match Evaluator.
Compare the Candidate Profile against the Job Description.
STRICT ANTI-HALLUCINATION RULES:
1. You must NEVER claim the candidate has a skill if it is not in their profile.
2. The Job Description is a list of requirements, NOT evidence that candidate possesses them.
3. Classify each requirement into one of:
   - "Supported": Explicitly evidenced in candidate profile.
   - "Partially Supported": Candidate has related/adjacent experience.
   - "Needs Confirmation": Candidate might possess this, but evidence is ambiguous.
   - "Not Found": Requirement is absent from candidate background.
Output strictly valid JSON:
{
  "matches": [
    {
      "requirement": string,
      "category": "Technical" | "Soft Skill" | "Experience" | "Education" | "Certification",
      "matchStatus": "Supported" | "Partially Supported" | "Needs Confirmation" | "Not Found",
      "candidateEvidence": string,
      "recommendation": string
    }
  ],
  "keywordCoveragePercentage": number,
  "tailoredSummarySuggestion": string
}
      `.trim();

      const candidateSummarySnippet = `
Name: ${profile.personalDetails.fullName}
Summary: ${profile.professionalSummary}
Skills: ${[
        ...profile.skills.technicalSkills,
        ...profile.skills.jobSkills,
        ...profile.skills.computerSkills,
      ].join(', ')}
Experience: ${profile.workExperience
        .map((e) => `${e.jobTitle} at ${e.employer}: ${e.responsibilities.join('; ')}`)
        .join('\n')}
Education: ${profile.education.map((e) => `${e.qualification} at ${e.institution}`).join('; ')}
      `;

      const userPrompt = `
TARGET JOB: ${jobTitle || 'Target Role'}
JOB DESCRIPTION:
${(jobDescriptionText || '').slice(0, 5000)}

CANDIDATE BACKGROUND:
${candidateSummarySnippet}
      `.trim();

      const heuristicFallback = () => {
        const candidateSkillsLower = [
          ...profile.skills.technicalSkills,
          ...profile.skills.jobSkills,
          ...profile.skills.computerSkills,
        ].map((s) => s.toLowerCase());

        const sampleReqs = ['TypeScript', 'React', 'Node.js', 'System Architecture', 'CI/CD Pipelines'];
        const matches: IRequirementMatch[] = sampleReqs.map((req) => {
          const isFound = candidateSkillsLower.some((cs) => cs.includes(req.toLowerCase()));
          return {
            requirement: req,
            category: 'Technical',
            matchStatus: (isFound ? 'Supported' : 'Not Found') as MatchStatus,
            candidateEvidence: isFound ? `Found in verified skills: ${req}` : undefined,
            recommendation: isFound
              ? 'Feature prominently in your professional summary and experience bullets.'
              : 'Add if you have verified experience with this tool, otherwise do not fabricate.',
          };
        });

        const supportedCount = matches.filter((m) => m.matchStatus === 'Supported').length;
        const coverage = Math.round((supportedCount / matches.length) * 100);

        return {
          matches,
          keywordCoveragePercentage: coverage,
          tailoredSummarySuggestion: `Results-driven ${profile.personalDetails.headline || 'professional'} with proven expertise in ${profile.skills.technicalSkills.slice(0, 3).join(', ')}. Demonstrated track record of delivering high-impact solutions with a focus on code quality, scalability, and collaborative execution.`,
        };
      };

      const matchResult = await geminiService.executeStructuredPrompt(
        req.user!._id.toString(),
        'candidate_matching',
        systemPrompt,
        userPrompt,
        heuristicFallback
      );

      res.status(200).json({
        success: true,
        data: matchResult,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/optimization/optimize-bullet
router.post(
  '/optimize-bullet',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { originalText, targetRole } = req.body;

      if (!originalText || originalText.trim().length < 5) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Original text is required.' } });
        return;
      }

      const systemPrompt = `
You are an expert ATS Resume Bullet Optimizer.
Improve the provided resume bullet point for maximum impact and ATS readability.
RULES:
1. Start with a strong action verb (e.g., Architected, Spearheaded, Optimized, Streamlined).
2. DO NOT fabricate metrics or unstated accomplishments. If metrics are missing, frame with qualitative impact.
3. Keep concise (1-2 lines, under 25 words).
Output strictly JSON:
{
  "improvedBullets": string[],
  "feedback": string
}
      `.trim();

      const userPrompt = `Target Role: ${targetRole || 'Professional'}\nOriginal Bullet: "${originalText}"`;

      const heuristicFallback = () => ({
        improvedBullets: [
          `Spearheaded ${originalText.toLowerCase().replace(/^(developed|worked on|managed)\s*/i, '')}, enhancing overall system reliability and delivery velocity.`,
          `Engineered scalable solutions for ${originalText.toLowerCase().replace(/^(developed|worked on|managed)\s*/i, '')}, collaborating closely with cross-functional stakeholders.`,
        ],
        feedback: 'Strengthened initial action verbs and emphasized deliverable outcomes.',
      });

      const result = await geminiService.executeStructuredPrompt(
        req.user!._id.toString(),
        'bullet_optimization',
        systemPrompt,
        userPrompt,
        heuristicFallback
      );

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

export const optimizationRoutes = router;
