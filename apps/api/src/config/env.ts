import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Load environment variables from apps/api/.env or root .env
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const EnvironmentSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_PORT: z.coerce.number().default(5000),
  WEB_PORT: z.coerce.number().default(3000),
  API_BASE_URL: z.string().default('http://localhost:5000'),
  WEB_ORIGIN: z.string().default(process.env.CORS_ORIGIN || 'http://localhost:3000'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  PUBLIC_APP_URL: z.string().default('http://localhost:3000'),
  MONGODB_URI: z.string().default('mongodb://127.0.0.1:27017/ats_resume_studio'),
  
  // Secrets
  SESSION_SECRET: z.string().default(process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'Secure365_session_token_cryptographic_secret'),
  COOKIE_SECRET: z.string().default('Secure365'),
  JWT_SECRET: z.string().default('Secure365'),
  JWT_REFRESH_SECRET: z.string().default('Secure365'),
  SESSION_MAX_AGE_SECONDS: z.coerce.number().default(604800),
  PASSWORD_RESET_TOKEN_SECRET: z.string().default('Secure365_password_reset_token_secret_32!'),
  
  // Nodemailer SMTP
  SMTP_SERVICE: z.string().default('gmail'),
  SMTP_HOST: z.string().default('smtp.gmail.com'),
  SMTP_PORT: z.coerce.number().default(465),
  SMTP_SECURE: z.coerce.boolean().default(true),
  SMTP_USER: z.string().default(process.env.SMTP_MAIL || ''),
  SMTP_MAIL: z.string().default(''),
  SMTP_PASS: z.string().default(process.env.SMTP_PASSWORD || ''),
  SMTP_PASSWORD: z.string().default(''),
  SMTP_FROM_NAME: z.string().default('ATS Resume Intelligence Studio'),
  SMTP_FROM_EMAIL: z.string().default(process.env.SMTP_MAIL || 'rightsight365@gmail.com'),

  // OTP Policies
  OTP_EXPIRY_SECONDS: z.coerce.number().default(300),
  OTP_MAX_ATTEMPTS: z.coerce.number().default(5),
  OTP_RESEND_COOLDOWN_SECONDS: z.coerce.number().default(60),

  // Google Gemini AI
  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash'),

  // AI Governance
  AI_MONTHLY_BUDGET: z.coerce.number().default(100.0),
  AI_DAILY_REQUEST_LIMIT: z.coerce.number().default(50),

  // File Uploads
  UPLOAD_MAX_FILE_SIZE_MB: z.coerce.number().default(10),
  UPLOAD_TEMP_DIRECTORY: z.string().default('./storage/temp'),

  LOG_LEVEL: z.string().default('info'),
});

const parsedEnv = EnvironmentSchema.safeParse({
  ...process.env,
  API_PORT: process.env.PORT || process.env.API_PORT || 5000,
  SMTP_USER: process.env.SMTP_USER || process.env.SMTP_MAIL,
  SMTP_PASS: process.env.SMTP_PASS || process.env.SMTP_PASSWORD,
  SMTP_FROM_EMAIL: process.env.SMTP_FROM_EMAIL || process.env.SMTP_MAIL || 'rightsight365@gmail.com',
  SESSION_SECRET: process.env.SESSION_SECRET || process.env.COOKIE_SECRET || process.env.JWT_SECRET || 'Secure365_session_token_cryptographic_secret',
  WEB_ORIGIN: process.env.WEB_ORIGIN || process.env.CORS_ORIGIN || 'http://localhost:3000',
  SMTP_SECURE: process.env.SMTP_PORT === '465' ? true : (process.env.SMTP_SECURE === 'true'),
});

if (!parsedEnv.success) {
  console.error('Invalid server environment configuration:');
  console.error(parsedEnv.error.format());
  process.exit(1);
}

export const env = parsedEnv.data;
