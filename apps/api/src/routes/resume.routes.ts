import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { ResumeVersion } from '../models/ResumeVersion';
import { CandidateProfile } from '../models/CandidateProfile';
import { ResumeVersionSchema } from '@ats/resume-schema';
import { getTemplateById } from '@ats/template-registry';

const router = Router();

// GET /api/v1/resumes
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resumes = await ResumeVersion.find({ userId: req.user!._id }).sort({ updatedAt: -1 });
    res.status(200).json({
      success: true,
      data: { resumes },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/resumes
router.post('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
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

    const templateId = req.body.templateId || 'classic-professional';
    const templateDef = getTemplateById(templateId);

    const resumeData = {
      userId: req.user!._id,
      candidateProfileId: profile._id,
      title: req.body.title || 'My Professional Resume',
      targetRole: req.body.targetRole || '',
      targetCategory: req.body.targetCategory || 'General',
      templateId,
      sectionOrder: req.body.sectionOrder || templateDef.defaultSectionOrder,
      sectionVisibility: req.body.sectionVisibility || {},
      formatting: req.body.formatting || templateDef.defaultFormatting,
    };

    const newResume = await ResumeVersion.create(resumeData);

    res.status(201).json({
      success: true,
      message: 'Resume version created successfully.',
      data: { resume: newResume },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/resumes/:resumeId
router.get('/:resumeId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    res.status(200).json({
      success: true,
      data: { resume, profile },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/resumes/:resumeId
router.patch('/:resumeId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const resume = await ResumeVersion.findOne({
      _id: req.params.resumeId,
      userId: req.user!._id,
    });

    if (!resume) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    const validated = ResumeVersionSchema.partial().parse(req.body);

    if (validated.title) resume.title = validated.title;
    if (validated.targetRole !== undefined) resume.targetRole = validated.targetRole;
    if (validated.targetCategory) resume.targetCategory = validated.targetCategory;
    if (validated.templateId) {
      resume.templateId = validated.templateId;
      // If template changed and user didn't specify sectionOrder, default to template order
      if (!req.body.sectionOrder) {
        resume.sectionOrder = getTemplateById(validated.templateId).defaultSectionOrder;
      }
    }
    if (validated.sectionOrder) resume.sectionOrder = validated.sectionOrder;
    if (validated.sectionVisibility) resume.sectionVisibility = validated.sectionVisibility as any;
    if (validated.formatting) resume.formatting = { ...resume.formatting, ...validated.formatting } as any;
    if (validated.customContentOverrides) {
      resume.customContentOverrides = {
        ...resume.customContentOverrides,
        ...validated.customContentOverrides,
      };
    }

    await resume.save();

    res.status(200).json({
      success: true,
      message: 'Resume updated successfully.',
      data: { resume },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/resumes/:resumeId/duplicate
router.post('/:resumeId/duplicate', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const source = await ResumeVersion.findOne({
      _id: req.params.resumeId,
      userId: req.user!._id,
    });

    if (!source) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    const duplicate = await ResumeVersion.create({
      userId: source.userId,
      candidateProfileId: source.candidateProfileId,
      title: `${source.title} (Copy)`,
      targetRole: source.targetRole,
      targetCategory: source.targetCategory,
      templateId: source.templateId,
      sectionOrder: source.sectionOrder,
      sectionVisibility: source.sectionVisibility,
      customContentOverrides: source.customContentOverrides,
      formatting: source.formatting,
      atsScore: source.atsScore,
    });

    res.status(201).json({
      success: true,
      message: 'Resume duplicated successfully.',
      data: { resume: duplicate },
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/v1/resumes/:resumeId
router.delete('/:resumeId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const deleted = await ResumeVersion.findOneAndDelete({
      _id: req.params.resumeId,
      userId: req.user!._id,
    });

    if (!deleted) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Resume not found' } });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
});

export const resumeRoutes = router;
