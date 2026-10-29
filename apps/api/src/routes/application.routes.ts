import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { JobApplication } from '../models/JobApplication';
import { geminiService } from '../services/gemini.service';
import { CandidateProfile } from '../models/CandidateProfile';

const router = Router();

// GET /api/v1/applications — List all applications for user
router.get(
  '/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const applications = await JobApplication.find({ userId: req.user!._id })
        .sort({ updatedAt: -1 })
        .limit(50);

      const statusCounts = {
        draft: 0, applied: 0, shortlisted: 0, interview: 0, offered: 0, rejected: 0, withdrawn: 0,
      };
      for (const app of applications) {
        statusCounts[app.status as keyof typeof statusCounts]++;
      }

      res.json({ success: true, data: { applications, statusCounts, total: applications.length } });
    } catch (error) {
      next(error);
    }
  }
);

// GET /api/v1/applications/:id — Get single application
router.get(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const app = await JobApplication.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!app) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found.' } });
        return;
      }
      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/applications — Create application (called after JD optimization)
router.post(
  '/',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resumeId, jobTitle, companyName, jdText, atsScore, matchScore, stretchedFields, status } = req.body;

      if (!jobTitle) {
        res.status(400).json({ success: false, error: { code: 'INVALID_INPUT', message: 'Job title is required.' } });
        return;
      }

      // Generate interview prep questions using Gemini
      let interviewPrepQuestions: any[] = [];
      const stretched = stretchedFields || [];

      if (stretched.length > 0) {
        const systemPrompt = `You are an expert career coach and interview preparation specialist.
Given a list of resume fields that were enhanced/stretched for a job application, generate targeted interview questions the candidate MUST be prepared to answer confidently.
For each question, provide a detailed suggested answer that sounds authentic, not rehearsed.
Output strictly valid JSON:
{
  "questions": [
    {
      "question": string,
      "suggestedAnswer": string,
      "relatedField": string,
      "category": "behavioral" | "technical" | "experience" | "situational",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`;

        const stretchedSummary = stretched.map((s: any) =>
          `Field: ${s.field} (${s.section})\nOriginal: ${s.originalValue}\nEnhanced to: ${s.enhancedValue}\nRisk: ${s.riskLevel}`
        ).join('\n\n');

        const userPrompt = `Job Title: ${jobTitle}\nCompany: ${companyName || 'Not specified'}\n\nStretched/Enhanced Fields:\n${stretchedSummary}\n\nGenerate 3-5 interview questions per stretched field, plus 3 general behavioral questions.`;

        const fallback = () => {
          const questions: any[] = [];
          for (const sf of stretched) {
            questions.push({
              question: `Can you walk me through your experience with ${sf.field}?`,
              suggestedAnswer: `In my previous role, I ${sf.enhancedValue.toLowerCase().substring(0, 200)}. I proactively sought opportunities to deepen this expertise through hands-on projects and self-directed learning.`,
              relatedField: sf.field,
              category: 'experience',
              difficulty: sf.riskLevel === 'high' ? 'hard' : 'medium',
            });
            questions.push({
              question: `Describe a specific challenge you faced using ${sf.field} and how you resolved it.`,
              suggestedAnswer: `One notable challenge was when I needed to optimize our ${sf.field} implementation. I analyzed the bottleneck, researched best practices, and implemented a solution that improved performance. This experience taught me the importance of systematic debugging and understanding system behavior at a deep level.`,
              relatedField: sf.field,
              category: 'situational',
              difficulty: 'medium',
            });
          }
          questions.push({
            question: `Why are you interested in this ${jobTitle} role at ${companyName || 'our company'}?`,
            suggestedAnswer: `I'm drawn to this role because it aligns perfectly with my technical trajectory and career goals. The opportunity to work on challenging problems using the tech stack described in the JD excites me.`,
            relatedField: 'general',
            category: 'behavioral',
            difficulty: 'easy',
          });
          return { questions };
        };

        try {
          const result = await geminiService.executeStructuredPrompt(
            req.user!._id.toString(),
            'interview_prep',
            systemPrompt,
            userPrompt,
            fallback
          );
          interviewPrepQuestions = result.questions || [];
        } catch {
          interviewPrepQuestions = fallback().questions;
        }
      }

      const application = await JobApplication.create({
        userId: req.user!._id,
        resumeId: resumeId || undefined,
        jobTitle,
        companyName: companyName || '',
        jdText: jdText || '',
        status: status || 'applied',
        atsScore: atsScore || 0,
        matchScore: matchScore || 0,
        stretchedFields: stretched,
        interviewPrepQuestions,
      });

      res.status(201).json({ success: true, data: { application } });
    } catch (error) {
      next(error);
    }
  }
);

// PATCH /api/v1/applications/:id — Update status
router.patch(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { status, notes } = req.body;
      const app = await JobApplication.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!app) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found.' } });
        return;
      }

      if (status) app.status = status;
      if (notes !== undefined) app.notes = notes;
      await app.save();

      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  }
);

// DELETE /api/v1/applications/:id
router.delete(
  '/:id',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await JobApplication.deleteOne({ _id: req.params.id, userId: req.user!._id });
      if (result.deletedCount === 0) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found.' } });
        return;
      }
      res.json({ success: true, message: 'Application deleted.' });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/applications/:id/generate-prep — Regenerate interview prep
router.post(
  '/:id/generate-prep',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const app = await JobApplication.findOne({ _id: req.params.id, userId: req.user!._id });
      if (!app) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found.' } });
        return;
      }

      const profile = await CandidateProfile.findOne({ userId: req.user!._id });

      const systemPrompt = `You are an expert interview coach preparing a candidate for a job interview.
The candidate applied for "${app.jobTitle}" at "${app.companyName}".
Based on the job description and any enhanced resume fields, generate comprehensive interview preparation.
Output strictly valid JSON:
{
  "questions": [
    {
      "question": string,
      "suggestedAnswer": string,
      "relatedField": string,
      "category": "behavioral" | "technical" | "experience" | "situational",
      "difficulty": "easy" | "medium" | "hard"
    }
  ]
}`;

      const stretchedSummary = (app.stretchedFields || []).map((s) =>
        `Enhanced: ${s.field} — From "${s.originalValue}" to "${s.enhancedValue}" (Risk: ${s.riskLevel})`
      ).join('\n');

      const profileSummary = profile
        ? `Skills: ${[...(profile.skills?.technicalSkills || []), ...(profile.skills?.jobSkills || [])].join(', ')}\nExperience: ${(profile.workExperience || []).map(e => `${e.jobTitle} at ${e.employer}`).join(', ')}`
        : '';

      const userPrompt = `Job: ${app.jobTitle} at ${app.companyName}\n\nJD:\n${(app.jdText || '').slice(0, 3000)}\n\nStretched Fields:\n${stretchedSummary || 'None'}\n\nCandidate Profile:\n${profileSummary}\n\nGenerate 8-12 diverse interview questions covering technical, behavioral, and situational scenarios.`;

      const fallback = () => ({
        questions: [
          { question: `Tell me about your experience as a ${app.jobTitle}.`, suggestedAnswer: `I have been working in this space and have developed strong skills in the core technologies required. Let me walk you through specific projects...`, relatedField: 'experience', category: 'experience', difficulty: 'easy' },
          { question: `What interests you about ${app.companyName}?`, suggestedAnswer: `I've been following ${app.companyName}'s work and I'm impressed by the technical challenges you're solving. The role aligns with my career trajectory.`, relatedField: 'general', category: 'behavioral', difficulty: 'easy' },
          { question: `Describe a challenging technical problem you solved recently.`, suggestedAnswer: `I encountered a performance bottleneck in our application that required deep analysis. I profiled the system, identified the root cause, and implemented an optimized solution.`, relatedField: 'technical', category: 'situational', difficulty: 'medium' },
        ]
      });

      const result = await geminiService.executeStructuredPrompt(
        req.user!._id.toString(),
        'interview_prep',
        systemPrompt,
        userPrompt,
        fallback
      );

      app.interviewPrepQuestions = (result.questions || []) as any;
      await app.save();

      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  }
);

export const applicationRoutes = router;
