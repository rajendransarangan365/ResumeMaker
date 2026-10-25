import { Router, Response, NextFunction } from 'express';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { CandidateProfile } from '../models/CandidateProfile';
import { CandidateProfileSchema } from '@ats/resume-schema';

const router = Router();

// GET /api/v1/profiles
router.get('/', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
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

    res.status(200).json({
      success: true,
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/profiles/:profileId
router.patch('/:profileId', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { profileId } = req.params;
    const profile = await CandidateProfile.findOne({ _id: profileId, userId: req.user!._id });

    if (!profile) {
      res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Candidate profile not found' },
      });
      return;
    }

    const validatedData = CandidateProfileSchema.partial().parse(req.body);
    Object.assign(profile, validatedData);
    await profile.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: { profile },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/profiles/career-gap-check
router.post('/career-gap-check', requireAuth, async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await CandidateProfile.findOne({ userId: req.user!._id });
    if (!profile) {
      res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found' } });
      return;
    }

    // Sort work experience by dates to identify gaps
    const experiences = [...profile.workExperience].filter((e) => e.startDate && e.endDate);
    const gaps: Array<{ startDate: string; endDate: string; durationMonths: number }> = [];

    // Simple date gap analysis
    // For production accuracy, we parse YYYY-MM or year strings
    experiences.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    for (let i = 0; i < experiences.length - 1; i++) {
      const currentEnd = experiences[i].endDate === 'Present' ? new Date() : new Date(experiences[i].endDate);
      const nextStart = new Date(experiences[i + 1].startDate);

      if (!isNaN(currentEnd.getTime()) && !isNaN(nextStart.getTime())) {
        const diffMs = nextStart.getTime() - currentEnd.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (diffDays > 180) {
          // Gap > ~6 months
          gaps.push({
            startDate: experiences[i].endDate,
            endDate: experiences[i + 1].startDate,
            durationMonths: Math.round(diffDays / 30),
          });
        }
      }
    }

    res.status(200).json({
      success: true,
      data: {
        detectedGaps: gaps,
        recommendations: [
          'If you completed freelance contracts during this period, list them under Work Experience as Freelance.',
          'If you developed personal or open-source software, add them under Projects.',
          'If you pursued certifications or education, add them under Education or Certifications.',
          'If you took family or personal leave, you may optionally include a brief truthful Career Break entry.',
        ],
      },
    });
  } catch (error) {
    next(error);
  }
});

export const profileRoutes = router;
