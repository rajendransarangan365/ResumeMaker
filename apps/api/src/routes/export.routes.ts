import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { ResumeVersion } from '../models/ResumeVersion';
import { CandidateProfile } from '../models/CandidateProfile';
import { generateDocxBuffer, generateResumeHtml, calculatePageMetrics } from '@ats/resume-renderer';

const router = Router();

// GET /api/v1/exports/preview/:resumeId
router.get('/preview/:resumeId', async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await ResumeVersion.findById(req.params.resumeId);
    if (!resume) {
      res.status(404).send('<h3>Resume not found</h3>');
      return;
    }

    const profile = await CandidateProfile.findById(resume.candidateProfileId);
    if (!profile) {
      res.status(404).send('<h3>Candidate profile not found</h3>');
      return;
    }

    const html = generateResumeHtml(profile.toObject() as any, resume.toObject() as any);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/exports/metrics/:resumeId
router.get('/metrics/:resumeId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await ResumeVersion.findOne({
      _id: req.params.resumeId,
      userId: req.user!._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    const profile = await CandidateProfile.findById(resume.candidateProfileId);
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      return;
    }

    const metrics = calculatePageMetrics(profile.toObject() as any, resume.formatting);

    res.status(200).json({
      success: true,
      data: { metrics },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/exports/docx
router.post('/docx', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resumeId } = req.body;
    const resume = await ResumeVersion.findOne({
      _id: resumeId,
      userId: req.user!._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    const profile = await CandidateProfile.findById(resume.candidateProfileId);
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      return;
    }

    const buffer = await generateDocxBuffer(profile.toObject() as any, resume.toObject() as any);
    const sanitizedTitle = (resume.title || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedTitle}.docx"`);
    res.setHeader('Content-Length', buffer.length);
    res.end(buffer);
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/exports/pdf
router.post('/pdf', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { resumeId } = req.body;
    const resume = await ResumeVersion.findOne({
      _id: resumeId,
      userId: req.user!._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    const profile = await CandidateProfile.findById(resume.candidateProfileId);
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      return;
    }

    // Generate print-ready HTML stream
    const html = generateResumeHtml(profile.toObject() as any, resume.toObject() as any);
    const sanitizedTitle = (resume.title || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', `inline; filename="${sanitizedTitle}.html"`);
    res.send(html);
  } catch (error) {
    next(error);
  }
});

export const exportRoutes = router;
