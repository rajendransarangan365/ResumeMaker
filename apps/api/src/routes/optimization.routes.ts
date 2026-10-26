import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { geminiService } from '../services/gemini.service';
import { CandidateProfile } from '../models/CandidateProfile';
import { ResumeVersion } from '../models/ResumeVersion';
import { getTemplateById } from '@ats/template-registry';
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
      const { originalText, targetRole, customPrompt } = req.body;

      if (!originalText || originalText.trim().length < 5) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Original text is required.' } });
        return;
      }

      const systemPrompt = `
You are an expert ATS Resume Bullet Optimizer.
Improve the provided resume bullet point for maximum impact, ATS readability, and recruiter impression.
RULES:
1. Start with a strong, decisive action verb (e.g., Architected, Optimized, Engineered, Streamlined, Automated).
2. DO NOT fabricate metrics or unstated accomplishments. If metrics are missing, frame with qualitative impact.
3. Keep concise (1-2 lines, under 25 words).
${customPrompt ? `4. Follow the user's specific prompt instruction: "${customPrompt}"` : ''}
Output strictly JSON:
{
  "improvedBullets": string[],
  "feedback": string
}
      `.trim();

      const userPrompt = `Target Role: ${targetRole || 'Professional'}
Original Bullet: "${originalText}"
${customPrompt ? `User Instruction / Direction: "${customPrompt}"` : ''}`;

      const heuristicFallback = () => {
        // Strip duplicate "spearheaded", "worked on", and existing trailers
        let clean = originalText
          .replace(/^(?:spearheaded\s+|worked\s+on\s+|helped\s+with\s+|involved\s+in\s+|assisted\s+in\s+)+/gi, '')
          .replace(/,\s*(?:enhancing\s+overall\s+system\s+reliability|collaborating\s+closely)[^.]*\.?$/i, '')
          .trim();

        const cp = (customPrompt || '').toLowerCase();

        // Context-aware action verb selection or prompt override
        let actionVerb = 'Engineered';
        if (cp.includes('lead') || cp.includes('direct') || cp.includes('manage')) {
          actionVerb = 'Directed';
        } else if (cp.includes('architect') || cp.includes('design') || cp.includes('system')) {
          actionVerb = 'Architected';
        } else if (cp.includes('metric') || cp.includes('number') || cp.includes('speed') || cp.includes('perform') || cp.includes('optimiz')) {
          actionVerb = 'Optimized';
        } else if (cp.includes('automat') || cp.includes('deploy') || cp.includes('test')) {
          actionVerb = 'Automated';
        } else if (/database|sql|query|performance|latency|downtime|speed|fast|cache|optimiz/i.test(clean)) {
          actionVerb = 'Optimized';
        } else if (/api|backend|service|server|node|endpoint|controller|architecture|stored\s+procedure/i.test(clean)) {
          actionVerb = 'Architected';
        } else if (/ui|frontend|react|responsive|figma|css|component|view|interface/i.test(clean)) {
          actionVerb = 'Developed';
        } else if (/test|deploy|docker|ci|pipeline|git|automate/i.test(clean)) {
          actionVerb = 'Automated';
        } else if (/task|workflow|management|role-based|coordinat/i.test(clean)) {
          actionVerb = 'Streamlined';
        } else {
          const verbs = ['Engineered', 'Delivered', 'Implemented', 'Refactored', 'Deployed'];
          actionVerb = verbs[Math.floor(Math.random() * verbs.length)];
        }

        // Clean initial weak verb if present
        clean = clean.replace(/^(?:developed|managed|created|built|designed|implemented|acquired|worked\s+on)\s+/i, '');
        let sentence = `${actionVerb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;

        // If custom prompt asked for metrics and none present, append a realistic metric
        if ((cp.includes('metric') || cp.includes('number') || cp.includes('quantif')) && !/\d+%|\d+x|\$\d+/i.test(sentence)) {
          sentence = sentence.replace(/\.$/, '') + ', resulting in 30% improvement in performance and reduced turnaround time.';
        }

        // If custom prompt asked for concise/short
        if (cp.includes('concise') || cp.includes('short') || cp.includes('brief')) {
          const words = sentence.split(' ');
          if (words.length > 15) {
            sentence = words.slice(0, 14).join(' ');
          }
        }

        const cleanedSentence = sentence.endsWith('.') ? sentence : `${sentence}.`;

        return {
          improvedBullets: [
            cleanedSentence,
            `Delivered ${clean.charAt(0).toLowerCase() + clean.slice(1)}${clean.endsWith('.') ? '' : '.'}`,
          ],
          feedback: customPrompt
            ? `Re-polished according to prompt: "${customPrompt}".`
            : `Upgraded verb to decisive action "${actionVerb}" and formatted for high ATS score.`,
        };
      };

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

// POST /api/v1/optimization/calibrate-resume
router.post(
  '/calibrate-resume',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { profile, targetRole } = req.body;

      if (!profile) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Profile data is required.' } });
        return;
      }

      const role = targetRole || profile.personalDetails?.headline || 'Software Engineer';

      const systemPrompt = `
You are an elite ATS Resume Calibration Specialist.
Analyze the candidate resume and output an authoritative calibration assessment to maximize ATS pass-rate and interview invitations.
RULES:
1. Do not fabricate unstated employers or credentials.
2. Upgrade weak verbs (worked on, helped, contributed to, handled) to strong action verbs (Architected, Engineered, Spearheaded, Optimized, Streamlined).
3. Frame bullets with clear action and business/technical outcome.
4. Provide a calibrated professional summary that hooks technical recruiters within 6 seconds.
Output strictly JSON matching this structure:
{
  "overallScore": number (0-100),
  "scores": {
    "impact": number (0-100),
    "verbs": number (0-100),
    "skills": number (0-100),
    "readability": number (0-100)
  },
  "recommendations": string[],
  "calibratedSummary": string,
  "calibratedBullets": [
    {
      "expId": string,
      "original": string,
      "improved": string
    }
  ],
  "suggestedSkills": {
    "technicalSkills": string[],
    "jobSkills": string[],
    "computerSkills": string[]
  }
}
      `.trim();

      const candidateText = `
Role Target: ${role}
Candidate Name: ${profile.personalDetails?.fullName || ''}
Current Summary: ${profile.professionalSummary || ''}
Work Experience:
${(profile.workExperience || [])
  .map((e: any) => `Job: ${e.jobTitle} at ${e.employer} (${e.startDate}-${e.endDate})\nBullets:\n${(e.responsibilities || []).map((r: string) => `- [${e.id}] ${r}`).join('\n')}`)
  .join('\n\n')}
Technical Skills: ${(profile.skills?.technicalSkills || []).join(', ')}
Core Competencies: ${(profile.skills?.jobSkills || []).join(', ')}
Tools: ${(profile.skills?.computerSkills || []).join(', ')}
      `.trim();

      const heuristicFallback = () => {
        // Heuristic calibration engine
        const exps = profile.workExperience || [];
        let totalBullets = 0;
        let actionVerbCount = 0;
        let metricCount = 0;
        const calibratedBullets: { expId: string; original: string; improved: string }[] = [];

        const strongVerbs = /^(architected|engineered|spearheaded|optimized|streamlined|delivered|implemented|developed|designed|built|accelerated|automated|enhanced)/i;
        const metricRegex = /\b(\d+%|\d+x|\$\d+|\d+\+?\s*(users|clients|requests|ms|seconds|hours|queries|endpoints|features))/i;

        for (const exp of exps) {
          const resps = exp.responsibilities || [];
          for (const b of resps) {
            totalBullets++;
            if (strongVerbs.test(b.trim())) actionVerbCount++;
            if (metricRegex.test(b)) metricCount++;

            // Strip any existing repeated "spearheaded", "worked on", or redundant trailers
            let clean = b
              .replace(/^(?:spearheaded\s+|worked\s+on\s+|helped\s+with\s+|involved\s+in\s+|assisted\s+in\s+)+/gi, '')
              .replace(/,\s*(?:enhancing\s+overall\s+system\s+reliability|collaborating\s+closely)[^.]*\.?$/i, '')
              .trim();

            // Transform junior/passive phrasing
            if (/^acquired\s+skills\s+in\s+/i.test(clean)) {
              clean = clean.replace(/^acquired\s+skills\s+in\s+/i, 'Built production applications utilizing ');
            }

            // Determine appropriate dynamic action verb based on bullet focus
            let verb = 'Engineered';
            if (/database|sql|query|performance|latency|downtime|stored\s+procedure|optimiz/i.test(clean)) {
              verb = 'Optimized';
            } else if (/ui|frontend|react|figma|responsive|landing|css/i.test(clean)) {
              verb = 'Developed';
            } else if (/api|endpoint|architecture|rest|controller|backend/i.test(clean)) {
              verb = 'Architected';
            } else if (/task|workflow|management|role-based|coordinat/i.test(clean)) {
              verb = 'Streamlined';
            } else {
              const pool = ['Delivered', 'Implemented', 'Engineered', 'Refactored', 'Designed'];
              verb = pool[totalBullets % pool.length];
            }

            // Remove duplicated initial action verbs
            clean = clean.replace(/^(?:developed|built|created|implemented|optimized|spearheaded|architected)\s+/i, '');
            let upgraded = `${verb} ${clean.charAt(0).toLowerCase() + clean.slice(1)}`;
            if (!upgraded.endsWith('.')) upgraded += '.';

            if (upgraded !== b) {
              calibratedBullets.push({
                expId: exp.id,
                original: b,
                improved: upgraded,
              });
            }
          }
        }

        const verbScore = totalBullets > 0 ? Math.min(100, Math.round((actionVerbCount / totalBullets) * 100) + 25) : 75;
        const impactScore = totalBullets > 0 ? Math.min(100, Math.round((metricCount / totalBullets) * 100) + 40) : 70;
        const skillCount = (profile.skills?.technicalSkills?.length || 0);
        const skillScore = Math.min(100, skillCount * 7 + 30);
        const readabilityScore = profile.professionalSummary && profile.professionalSummary.length > 80 ? 90 : 70;
        const overallScore = Math.round((verbScore + impactScore + skillScore + readabilityScore) / 4);

        const recommendations: string[] = [];
        if (impactScore < 80) recommendations.push('Quantify key achievements with measurable performance numbers (e.g. latency, query speed, user volume).');
        if (verbScore < 85) recommendations.push('Start every bullet point with a decisive action verb (Architected, Engineered, Streamlined).');
        if (skillCount < 8) recommendations.push('Expand your technical skills list to include key frameworks, APIs, and cloud toolchains.');
        recommendations.push('Align your professional summary directly with your target role to capture immediate recruiter interest.');

        const calibratedSummary = `Results-oriented ${role} with proven expertise in ${
          (profile.skills?.technicalSkills || ['React', 'Node.js', 'TypeScript']).slice(0, 4).join(', ')
        }. Demonstrated track record of building robust, scalable applications, optimizing database performance, and delivering responsive user interfaces aligned with modern engineering standards.`;

        return {
          overallScore,
          scores: {
            impact: impactScore,
            verbs: verbScore,
            skills: skillScore,
            readability: readabilityScore,
          },
          recommendations,
          calibratedSummary,
          calibratedBullets: calibratedBullets.slice(0, 8),
          suggestedSkills: {
            technicalSkills: Array.from(new Set([...(profile.skills?.technicalSkills || []), 'REST APIs', 'TypeScript', 'Responsive Design'])),
            jobSkills: Array.from(new Set([...(profile.skills?.jobSkills || []), 'Agile SDLC', 'Code Review', 'Cross-Functional Collaboration'])),
            computerSkills: Array.from(new Set([...(profile.skills?.computerSkills || []), 'Git', 'Visual Studio Code', 'Postman'])),
          },
        };
      };

      const result = await geminiService.executeStructuredPrompt(
        req.user!._id.toString(),
        'bullet_optimization',
        systemPrompt,
        candidateText,
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

// POST /api/v1/optimization/reconstruct-resume
router.post(
  '/reconstruct-resume',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobTitle, companyName, jobDescriptionText, existingResumeId, templateId } = req.body;

      if (!jobTitle || !jobDescriptionText) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_INPUT', message: 'Target job title and job description are required.' },
        });
        return;
      }

      // 1. Get or create candidate profile
      let profile = await CandidateProfile.findOne({ userId: req.user!._id });
      if (!profile) {
        profile = await CandidateProfile.create({
          userId: req.user!._id,
          profileTitle: 'Master Profile',
          personalDetails: {
            fullName: req.user!.fullName,
            email: req.user!.email,
            phone: '',
          },
        });
      }

      // 2. Extract keywords from JD to prioritize matching candidate skills
      const jdTokens = (jobDescriptionText.match(/[a-zA-Z0-9#+.]+/g) || []).map((w: string) => w.toLowerCase());
      const candidateSkills = profile.skills?.technicalSkills || [];

      // Prioritize skills matching the vacancy
      const prioritizedSkills = [...candidateSkills].sort((a, b) => {
        const aMatch = jdTokens.includes(a.toLowerCase());
        const bMatch = jdTokens.includes(b.toLowerCase());
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
      });

      // 3. Tailor headline and summary directly to the target vacancy
      // IMPORTANT: The target hiring company belongs ONLY in the resume title/application tracker,
      // NEVER in the candidate's personal resume headline.
      const currentHeadline = profile.personalDetails.headline || '';
      // Clean any accidental company name from existing headline
      let cleanedHeadline = currentHeadline;
      if (companyName && cleanedHeadline.toLowerCase().includes(companyName.toLowerCase())) {
        cleanedHeadline = cleanedHeadline
          .replace(new RegExp(`\\s*\\|\\s*${companyName}.*`, 'i'), '')
          .replace(new RegExp(`\\s*-\\s*${companyName}.*`, 'i'), '')
          .trim();
      }
      
      const existingSpecialization = cleanedHeadline.split('|')[1]?.trim();
      const tailoredHeadline = existingSpecialization
        ? `${jobTitle} | ${existingSpecialization}`
        : jobTitle;

      const matchedSkillPreview = prioritizedSkills.slice(0, 4).join(', ');

      const tailoredSummary = `Results-oriented ${jobTitle} with proven expertise in ${
        matchedSkillPreview || 'modern software engineering and scalable systems'
      }. Demonstrated track record of building resilient web architectures, optimizing performance, and collaborating cross-functionally to deliver high-quality business outcomes aligned with ATS requirements.`;

      // Update candidate profile
      profile.personalDetails.headline = tailoredHeadline;
      profile.professionalSummary = tailoredSummary;
      if (prioritizedSkills.length > 0) {
        profile.skills.technicalSkills = prioritizedSkills;
      }
      await profile.save();

      // 4. Create or update resume version
      const selectedTemplateId = templateId || 'software-developer';
      const templateDef = getTemplateById(selectedTemplateId);
      const resumeTitle = `${jobTitle}${companyName ? ` - ${companyName}` : ''} (Tailored)`;

      let targetResume;
      if (existingResumeId) {
        targetResume = await ResumeVersion.findOne({ _id: existingResumeId, userId: req.user!._id });
        if (targetResume) {
          targetResume.title = resumeTitle;
          targetResume.targetRole = jobTitle;
          targetResume.targetCategory = 'Engineering & Tech';
          targetResume.templateId = selectedTemplateId;
          targetResume.formatting = { ...templateDef.defaultFormatting, ...targetResume.formatting };
          await targetResume.save();
        }
      }

      if (!targetResume) {
        targetResume = await ResumeVersion.create({
          userId: req.user!._id,
          candidateProfileId: profile._id,
          title: resumeTitle,
          targetRole: jobTitle,
          targetCategory: 'Engineering & Tech',
          templateId: selectedTemplateId,
          sectionOrder: templateDef.defaultSectionOrder,
          sectionVisibility: {},
          formatting: templateDef.defaultFormatting,
        });
      }

      res.status(200).json({
        success: true,
        message: 'Resume reconstructed and tailored successfully for this job vacancy.',
        data: {
          resumeId: targetResume._id,
          resume: targetResume,
          profile,
          tailoredSummary,
          prioritizedSkills,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const optimizationRoutes = router;

