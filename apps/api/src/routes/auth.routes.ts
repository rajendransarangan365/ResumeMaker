import { Router, Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { User } from '../models/User';
import { AuthChallenge } from '../models/AuthChallenge';
import { SecurityAuditLog } from '../models/SecurityAuditLog';
import { CandidateProfile } from '../models/CandidateProfile';
import { emailService } from '../services/email.service';
import { validateBody } from '../middleware/validate.middleware';
import { loginLimiter, otpLimiter } from '../middleware/rate-limiter.middleware';
import { requireAuth, AuthenticatedRequest } from '../middleware/auth.middleware';
import {
  RegisterSchema,
  LoginSchema,
  VerifyOtpSchema,
  ResendOtpSchema,
  ForgotPasswordSchema,
  ResetPasswordSchema,
} from '@ats/resume-schema';

const router = Router();

function hashOtp(otp: string): string {
  return crypto.createHash('sha256').update(otp).digest('hex');
}

function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

function setSessionCookie(res: Response, token: string) {
  res.cookie('session_token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: env.SESSION_MAX_AGE_SECONDS * 1000,
    path: '/',
  });
}

// -----------------------------------------------------------------------------
// POST /register
// -----------------------------------------------------------------------------
router.post(
  '/register',
  validateBody(RegisterSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { fullName, email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        if (existingUser.isEmailVerified) {
          // Do not reveal if email is already taken
          res.status(200).json({
            success: true,
            message: 'If an account does not already exist, a verification code has been sent.',
          });
          return;
        } else {
          // Update password and issue fresh OTP
          const passwordHash = await bcrypt.hash(password, 12);
          existingUser.fullName = fullName;
          existingUser.passwordHash = passwordHash;
          await existingUser.save();
        }
      } else {
        const passwordHash = await bcrypt.hash(password, 12);
        await User.create({
          fullName,
          email: normalizedEmail,
          passwordHash,
          isEmailVerified: false,
          status: 'pending_verification',
        });
      }

      // Generate & store OTP
      const otp = generateOtp();
      const hashedCode = hashOtp(otp);
      const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

      // Invalidate existing challenges
      await AuthChallenge.updateMany(
        { email: normalizedEmail, challengeType: 'email_verification' },
        { isConsumed: true }
      );

      await AuthChallenge.create({
        email: normalizedEmail,
        challengeType: 'email_verification',
        hashedCode,
        expiresAt,
        maxAttempts: env.OTP_MAX_ATTEMPTS,
      });

      const mailResult = await emailService.sendVerificationOtp(normalizedEmail, otp);

      await SecurityAuditLog.create({
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        action: 'USER_REGISTRATION_REQUESTED',
        status: mailResult.sent ? 'success' : 'partial_success',
        metadata: { email: normalizedEmail, emailDelivery: mailResult },
      });

      res.status(201).json({
        success: true,
        message: mailResult.sent
          ? 'Registration initiated. Verification OTP sent to your email.'
          : `Account created, but email delivery failed (${mailResult.reason || 'mail error'}).`,
        data: {
          emailDelivery: {
            sent: mailResult.sent,
            reason: mailResult.reason,
            fallbackOtp: !mailResult.sent ? otp : undefined,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /verify-email
// -----------------------------------------------------------------------------
router.post(
  '/verify-email',
  otpLimiter,
  validateBody(VerifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const challenge = await AuthChallenge.findOne({
        email: normalizedEmail,
        challengeType: 'email_verification',
        isConsumed: false,
      }).sort({ createdAt: -1 });

      if (!challenge) {
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_CHALLENGE',
            message: 'No pending verification challenge found. Please request a new code.',
          },
        });
        return;
      }

      if (new Date() > challenge.expiresAt) {
        res.status(400).json({
          success: false,
          error: {
            code: 'OTP_EXPIRED',
            message: 'Verification code has expired. Please request a new code.',
          },
        });
        return;
      }

      if (challenge.failedAttempts >= challenge.maxAttempts) {
        challenge.isConsumed = true;
        await challenge.save();
        res.status(400).json({
          success: false,
          error: {
            code: 'MAX_ATTEMPTS_EXCEEDED',
            message: 'Too many incorrect attempts. This code is invalidated.',
          },
        });
        return;
      }

      const submittedHash = hashOtp(otp);
      if (submittedHash !== challenge.hashedCode) {
        challenge.failedAttempts += 1;
        await challenge.save();
        res.status(400).json({
          success: false,
          error: {
            code: 'INCORRECT_OTP',
            message: `Incorrect code. ${challenge.maxAttempts - challenge.failedAttempts} attempts remaining.`,
          },
        });
        return;
      }

      // Mark challenge consumed
      challenge.isConsumed = true;
      await challenge.save();

      // Activate user
      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
        return;
      }

      user.isEmailVerified = true;
      user.emailVerifiedAt = new Date();
      user.status = 'active';
      await user.save();

      // Ensure Master Candidate Profile exists
      const existingProfile = await CandidateProfile.findOne({ userId: user._id });
      if (!existingProfile) {
        await CandidateProfile.create({
          userId: user._id,
          profileTitle: 'Master Profile',
          personalDetails: {
            fullName: user.fullName,
            email: user.email,
            phone: '',
          },
        });
      }

      // Generate session token
      const token = jwt.sign({ userId: user._id }, env.SESSION_SECRET, {
        expiresIn: `${env.SESSION_MAX_AGE_SECONDS}s`,
      });

      setSessionCookie(res, token);

      await SecurityAuditLog.create({
        userId: user._id,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        action: 'EMAIL_VERIFICATION_SUCCESSFUL',
        status: 'success',
      });

      res.status(200).json({
        success: true,
        message: 'Email successfully verified.',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /resend-verification
// -----------------------------------------------------------------------------
router.post(
  '/resend-verification',
  otpLimiter,
  validateBody(ResendOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const lastChallenge = await AuthChallenge.findOne({
        email: normalizedEmail,
        challengeType: 'email_verification',
      }).sort({ createdAt: -1 });

      if (lastChallenge) {
        const secondsSinceCreation = (Date.now() - lastChallenge.createdAt.getTime()) / 1000;
        if (secondsSinceCreation < env.OTP_RESEND_COOLDOWN_SECONDS) {
          const waitTime = Math.ceil(env.OTP_RESEND_COOLDOWN_SECONDS - secondsSinceCreation);
          res.status(429).json({
            success: false,
            error: {
              code: 'RESEND_COOLDOWN',
              message: `Please wait ${waitTime} seconds before requesting another code.`,
            },
          });
          return;
        }
      }

      const otp = generateOtp();
      const hashedCode = hashOtp(otp);
      const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

      await AuthChallenge.updateMany(
        { email: normalizedEmail, challengeType: 'email_verification' },
        { isConsumed: true }
      );

      await AuthChallenge.create({
        email: normalizedEmail,
        challengeType: 'email_verification',
        hashedCode,
        expiresAt,
        maxAttempts: env.OTP_MAX_ATTEMPTS,
      });

      const mailResult = await emailService.sendVerificationOtp(normalizedEmail, otp);

      res.status(200).json({
        success: true,
        message: mailResult.sent
          ? 'Verification code resent successfully.'
          : `Fresh code generated, but email delivery failed (${mailResult.reason || 'mail error'}).`,
        data: {
          emailDelivery: {
            sent: mailResult.sent,
            reason: mailResult.reason,
            fallbackOtp: !mailResult.sent ? otp : undefined,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /login
// -----------------------------------------------------------------------------
router.post(
  '/login',
  loginLimiter,
  validateBody(LoginSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: normalizedEmail });
      if (!user) {
        await SecurityAuditLog.create({
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
          action: 'LOGIN_FAILURE',
          status: 'failure',
          metadata: { email: normalizedEmail, reason: 'USER_NOT_FOUND' },
        });
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
        return;
      }

      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        await SecurityAuditLog.create({
          userId: user._id,
          ipAddress: req.ip || '127.0.0.1',
          userAgent: req.headers['user-agent'] || '',
          action: 'LOGIN_FAILURE',
          status: 'failure',
          metadata: { reason: 'PASSWORD_MISMATCH' },
        });
        res.status(401).json({
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password.',
          },
        });
        return;
      }

      if (!user.isEmailVerified) {
        res.status(403).json({
          success: false,
          error: {
            code: 'EMAIL_NOT_VERIFIED',
            message: 'Your email has not been verified yet. Please enter your verification code.',
          },
        });
        return;
      }

      const token = jwt.sign({ userId: user._id }, env.SESSION_SECRET, {
        expiresIn: `${env.SESSION_MAX_AGE_SECONDS}s`,
      });

      setSessionCookie(res, token);

      await SecurityAuditLog.create({
        userId: user._id,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        action: 'LOGIN_SUCCESS',
        status: 'success',
      });

      res.status(200).json({
        success: true,
        message: 'Login successful.',
        data: {
          user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            isEmailVerified: user.isEmailVerified,
            role: user.role,
          },
          token,
        },
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /logout
// -----------------------------------------------------------------------------
router.post('/logout', (req: Request, res: Response): void => {
  res.clearCookie('session_token', { path: '/' });
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

// -----------------------------------------------------------------------------
// POST /forgot-password
// -----------------------------------------------------------------------------
router.post(
  '/forgot-password',
  otpLimiter,
  validateBody(ForgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const user = await User.findOne({ email: normalizedEmail });
      if (user) {
        const otp = generateOtp();
        const hashedCode = hashOtp(otp);
        const expiresAt = new Date(Date.now() + env.OTP_EXPIRY_SECONDS * 1000);

        await AuthChallenge.updateMany(
          { email: normalizedEmail, challengeType: 'password_reset' },
          { isConsumed: true }
        );

        await AuthChallenge.create({
          userId: user._id,
          email: normalizedEmail,
          challengeType: 'password_reset',
          hashedCode,
          expiresAt,
          maxAttempts: env.OTP_MAX_ATTEMPTS,
        });

        const mailResult = await emailService.sendPasswordResetOtp(normalizedEmail, otp);

        res.status(200).json({
          success: true,
          message: mailResult.sent
            ? 'Recovery instructions have been sent to your email.'
            : `Recovery initiated, but email delivery failed (${mailResult.reason || 'mail error'}).`,
          data: {
            emailDelivery: {
              sent: mailResult.sent,
              reason: mailResult.reason,
              fallbackOtp: !mailResult.sent ? otp : undefined,
            },
          },
        });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'If an account is associated with this email, recovery instructions have been sent.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /verify-reset-otp
// -----------------------------------------------------------------------------
router.post(
  '/verify-reset-otp',
  otpLimiter,
  validateBody(VerifyOtpSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { email, otp } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      const challenge = await AuthChallenge.findOne({
        email: normalizedEmail,
        challengeType: 'password_reset',
        isConsumed: false,
      }).sort({ createdAt: -1 });

      if (!challenge || new Date() > challenge.expiresAt) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_OTP', message: 'Recovery code is invalid or has expired.' },
        });
        return;
      }

      if (challenge.failedAttempts >= challenge.maxAttempts) {
        challenge.isConsumed = true;
        await challenge.save();
        res.status(400).json({
          success: false,
          error: { code: 'MAX_ATTEMPTS', message: 'Too many incorrect attempts.' },
        });
        return;
      }

      if (hashOtp(otp) !== challenge.hashedCode) {
        challenge.failedAttempts += 1;
        await challenge.save();
        res.status(400).json({
          success: false,
          error: {
            code: 'INCORRECT_OTP',
            message: `Incorrect code. ${challenge.maxAttempts - challenge.failedAttempts} attempts left.`,
          },
        });
        return;
      }

      challenge.isConsumed = true;
      await challenge.save();

      // Issue temporary reset token valid for 10 minutes
      const resetToken = jwt.sign(
        { email: normalizedEmail, purpose: 'password_reset' },
        env.PASSWORD_RESET_TOKEN_SECRET,
        { expiresIn: '10m' }
      );

      res.status(200).json({
        success: true,
        message: 'Recovery code verified.',
        data: { resetToken },
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// POST /reset-password
// -----------------------------------------------------------------------------
router.post(
  '/reset-password',
  validateBody(ResetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { resetToken, newPassword } = req.body;

      let decoded: { email: string; purpose: string };
      try {
        decoded = jwt.verify(resetToken, env.PASSWORD_RESET_TOKEN_SECRET) as any;
      } catch (tokenErr) {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Reset token is invalid or has expired.' },
        });
        return;
      }

      if (decoded.purpose !== 'password_reset') {
        res.status(400).json({
          success: false,
          error: { code: 'INVALID_TOKEN', message: 'Invalid token purpose.' },
        });
        return;
      }

      const user = await User.findOne({ email: decoded.email });
      if (!user) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found.' } });
        return;
      }

      user.passwordHash = await bcrypt.hash(newPassword, 12);
      user.passwordChangedAt = new Date();
      await user.save();

      await SecurityAuditLog.create({
        userId: user._id,
        ipAddress: req.ip || '127.0.0.1',
        userAgent: req.headers['user-agent'] || '',
        action: 'PASSWORD_RESET_SUCCESS',
        status: 'success',
      });

      res.status(200).json({
        success: true,
        message: 'Password successfully updated. You may now log in.',
      });
    } catch (error) {
      next(error);
    }
  }
);

// -----------------------------------------------------------------------------
// GET /me
// -----------------------------------------------------------------------------
router.get('/me', requireAuth, (req: AuthenticatedRequest, res: Response): void => {
  res.status(200).json({
    success: true,
    data: {
      user: {
        id: req.user!._id,
        fullName: req.user!.fullName,
        email: req.user!.email,
        isEmailVerified: req.user!.isEmailVerified,
        role: req.user!.role,
      },
    },
  });
});

export const authRoutes = router;
