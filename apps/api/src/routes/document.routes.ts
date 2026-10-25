import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import { uploadLimiter } from '../middleware/rate-limiter.middleware';
import { UploadedDocument } from '../models/UploadedDocument';
import { CandidateProfile } from '../models/CandidateProfile';
import { parsingService } from '../services/parsing.service';
import { env } from '../config/env';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.resolve(process.cwd(), env.UPLOAD_TEMP_DIRECTORY);
fs.mkdir(uploadDir, { recursive: true }).catch(console.error);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_FILE_SIZE_MB * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.pdf', '.docx', '.txt', '.rtf', '.odt', '.jpg', '.jpeg', '.png'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${ext}. Supported types: PDF, DOCX, TXT, RTF, ODT, JPEG, PNG`));
    }
  },
});

// POST /api/v1/documents/upload
router.post(
  '/upload',
  requireAuth,
  uploadLimiter,
  upload.single('file'),
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, error: { code: 'FILE_MISSING', message: 'No file uploaded.' } });
        return;
      }

      const doc = await UploadedDocument.create({
        userId: req.user!._id,
        originalFileName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSizeBytes: req.file.size,
        storagePath: req.file.path,
        processingStatus: 'uploaded',
      });

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully.',
        data: {
          documentId: doc._id,
          fileName: doc.originalFileName,
          fileSize: doc.fileSizeBytes,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// POST /api/v1/documents/parse/:documentId
router.post(
  '/parse/:documentId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await UploadedDocument.findOne({
        _id: req.params.documentId,
        userId: req.user!._id,
      });

      if (!doc) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
        return;
      }

      doc.processingStatus = 'processing';
      await doc.save();

      // Extract raw text
      const rawText = await parsingService.extractRawText(doc.storagePath, doc.mimeType);
      doc.extractedText = rawText;

      // Extract structured fields via Gemini / heuristic fallback
      const parsedData = await parsingService.parseResumeText(req.user!._id.toString(), rawText);

      doc.parsedProfileSnapshot = parsedData;
      doc.processingStatus = 'parsed';
      await doc.save();

      res.status(200).json({
        success: true,
        message: 'Resume parsed successfully. Please review extracted information.',
        data: {
          documentId: doc._id,
          parsedData,
          rawTextSnippet: rawText.slice(0, 500),
        },
      });
    } catch (error: any) {
      next(error);
    }
  }
);

// POST /api/v1/documents/apply-to-profile/:documentId
router.post(
  '/apply-to-profile/:documentId',
  requireAuth,
  async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const doc = await UploadedDocument.findOne({
        _id: req.params.documentId,
        userId: req.user!._id,
      });

      if (!doc || !doc.parsedProfileSnapshot) {
        res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'No parsed data available to apply.' } });
        return;
      }

      const profile = await CandidateProfile.findOne({ userId: req.user!._id });
      if (!profile) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Profile not found.' } });
        return;
      }

      // Update candidate profile with parsed info (user confirmed)
      const data = req.body.reviewedData || doc.parsedProfileSnapshot;
      if (data.personalDetails) Object.assign(profile.personalDetails, data.personalDetails);
      if (data.professionalSummary) profile.professionalSummary = data.professionalSummary;
      if (data.education && Array.isArray(data.education)) profile.education = data.education as any;
      if (data.workExperience && Array.isArray(data.workExperience)) profile.workExperience = data.workExperience as any;
      if (data.projects && Array.isArray(data.projects)) profile.projects = data.projects as any;
      if (data.skills) profile.skills = data.skills as any;
      if (data.certifications && Array.isArray(data.certifications)) profile.certifications = data.certifications as any;
      if (data.uncategorizedInformation && Array.isArray(data.uncategorizedInformation)) {
        profile.uncategorizedInformation = data.uncategorizedInformation;
      }

      await profile.save();

      res.status(200).json({
        success: true,
        message: 'Candidate profile updated with parsed information.',
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }
);

export const documentRoutes = router;
