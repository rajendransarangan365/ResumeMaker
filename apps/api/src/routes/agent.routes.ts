import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { agentService } from '../services/agent.service';
import { CandidateProfile } from '../models/CandidateProfile';
import { ResumeVersion } from '../models/ResumeVersion';

const router = Router();

// GET /api/v1/agents/health
router.get('/health', async (_req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const health = await agentService.checkAgentHealth();
    res.json({
      success: true,
      data: {
        pythonService: health.isOnline ? 'online' : 'offline (local deterministic engine active)',
        pythonDetails: health.details || null,
        localEngine: 'ready',
        totalJobFamiliesLoaded: 20,
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/agents/knowledge/job-families
router.get('/knowledge/job-families', (_req, res: Response): void => {
  const families = agentService.getJobFamilies();
  res.json({
    success: true,
    data: {
      total: families.length,
      jobFamilies: families,
    },
  });
});

// GET /api/v1/agents/knowledge/job-families/:id
router.get('/knowledge/job-families/:id', (req, res: Response): void => {
  const family = agentService.getJobFamilyById(req.params.id);
  if (!family) {
    res.status(404).json({ success: false, error: 'Job family not found' });
    return;
  }
  res.json({ success: true, data: { jobFamily: family } });
});

// POST /api/v1/agents/orchestrate
router.post(
  '/orchestrate',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resumeId, jobTitle, companyName, rawText, preferredTemplateId } = req.body;

      // 1. Fetch candidate profile
      let candidateProfile = await CandidateProfile.findOne({ userId: req.user!._id });
      if (!candidateProfile) {
        // Fallback default profile if not yet created
        candidateProfile = {
          userId: req.user!._id,
          personalDetails: {
            fullName: req.user!.fullName,
            email: req.user!.email,
            phone: '+1 (555) 000-0000',
            headline: 'Professional',
          },
          skills: {
            technicalSkills: ['Problem Solving', 'Communication'],
            jobSkills: ['Project Delivery'],
            computerSkills: ['Office Tools'],
          },
          workExperience: [],
          education: [],
          projects: [],
        } as any;
      }

      // 2. Execute Orchestration
      const profileData = candidateProfile && typeof candidateProfile.toObject === 'function'
        ? candidateProfile.toObject()
        : candidateProfile;

      const result = await agentService.orchestrate(
        profileData as any,
        { jobTitle: jobTitle || 'Professional Role', companyName, rawText: rawText || '' },
        preferredTemplateId
      );

      // 3. If resumeId provided, optionally update resume version
      if (resumeId && result.success) {
        const resume = await ResumeVersion.findOne({ _id: resumeId, userId: req.user!._id });
        if (resume) {
          resume.templateId = result.selectedTemplateId;
          resume.updatedAt = new Date();
          await resume.save();
        }
      }

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/agents/match
router.post(
  '/match',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { jobTitle, companyName, rawText } = req.body;

      const candidateProfile = await CandidateProfile.findOne({ userId: req.user!._id });
      if (!candidateProfile) {
        res.status(404).json({ success: false, error: 'Please create a candidate profile first' });
        return;
      }

      const profileData = typeof candidateProfile.toObject === 'function'
        ? candidateProfile.toObject()
        : candidateProfile;

      const result = await agentService.orchestrate(
        profileData as any,
        { jobTitle, companyName, rawText: rawText || '' }
      );

      res.status(200).json({
        success: true,
        data: {
          matchReport: result.matchReport,
          evaluationScorecard: result.evaluationScorecard,
          executionTrace: result.executionTrace,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const agentRoutes = router;
