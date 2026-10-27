import { z } from 'zod';

// -----------------------------------------------------------------------------
// Authentication & Security Schemas
// -----------------------------------------------------------------------------
export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address').trim().toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmPassword: z.string(),
  termsAccepted: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the Terms of Service and Privacy Policy' }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be exactly 6 digits'),
});

export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export const ForgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
});

export const ResetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128)
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: 'Passwords do not match',
  path: ['confirmNewPassword'],
});

export const SecurityQuestionSchema = z.object({
  question: z.string().min(5, 'Question must be at least 5 characters'),
  answer: z.string().min(2, 'Answer must be at least 2 characters'),
});

// -----------------------------------------------------------------------------
// Candidate Profile Schemas
// -----------------------------------------------------------------------------
export const PersonalDetailsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(30).default(''),
  headline: z.string().max(150).optional().default(''),
  address: z.string().max(200).optional().default(''),
  city: z.string().max(100).optional().default(''),
  state: z.string().max(100).optional().default(''),
  country: z.string().max(100).optional().default(''),
  postalCode: z.string().max(20).optional().default(''),
  preferredLocation: z.string().max(100).optional().default(''),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')).optional().default(''),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).optional().default(''),
  portfolioUrl: z.string().url('Invalid Portfolio URL').or(z.literal('')).optional().default(''),
});

export const EducationSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  qualification: z.string().min(1, 'Qualification is required'),
  specialization: z.string().optional().default(''),
  institution: z.string().min(1, 'Institution is required'),
  universityBoard: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  gradePercentageCgpa: z.string().optional().default(''),
  academicAchievements: z.array(z.string()).optional().default([]),
  coursework: z.array(z.string()).optional().default([]),
  includeInResume: z.boolean().default(true),
});

export const WorkExperienceSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  employer: z.string().min(1, 'Employer name is required'),
  jobTitle: z.string().min(1, 'Job title is required'),
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship', 'Apprenticeship']).default('Full-time'),
  location: z.string().optional().default(''),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().default('Present'),
  isCurrent: z.boolean().default(false),
  duration: z.string().optional().default(''),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).optional().default([]),
  includeInResume: z.boolean().default(true),
});

export const ProjectSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  name: z.string().min(1, 'Project name is required'),
  category: z.enum(['Academic', 'Professional', 'Personal', 'Open-Source']).default('Professional'),
  role: z.string().optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  description: z.string().min(1, 'Description is required'),
  responsibilities: z.array(z.string()).optional().default([]),
  technologies: z.array(z.string()).default([]),
  url: z.string().url('Invalid URL').or(z.literal('')).optional().default(''),
  includeInResume: z.boolean().default(true),
});

export const LanguageSchema = z.object({
  name: z.string().min(1, 'Language name is required'),
  proficiency: z.enum(['Basic', 'Conversational', 'Professional', 'Native/Bilingual']).default('Professional'),
});

export const SkillsSchema = z.object({
  technicalSkills: z.array(z.string()).default([]),
  jobSkills: z.array(z.string()).default([]),
  computerSkills: z.array(z.string()).default([]),
  languages: z.array(LanguageSchema).default([]),
  additionalSkills: z.array(z.string()).default([]),
});

export const CertificationSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  title: z.string().min(1, 'Certification title is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().optional().default(''),
  credentialId: z.string().optional().default(''),
  credentialUrl: z.string().url().or(z.literal('')).optional().default(''),
  includeInResume: z.boolean().default(true),
});

export const BusinessExperienceSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  businessName: z.string().min(1, 'Business name is required'),
  industry: z.string().optional().default(''),
  role: z.string().min(1, 'Role is required'),
  duration: z.string().optional().default(''),
  responsibilities: z.array(z.string()).default([]),
  includeInResume: z.boolean().default(true),
});

export const CurrentOccupationSchema = z.object({
  status: z.enum(['Employed', 'Self-employed', 'Freelancer', 'Business Owner', 'Student', 'Job Seeker', 'Career Break', 'Other']).default('Employed'),
  notes: z.string().optional().default(''),
});

export const CareerGapSchema = z.object({
  id: z.string().default(() => Math.random().toString(36).substring(2, 9)),
  startDate: z.string(),
  endDate: z.string(),
  reasonCategory: z.enum(['Freelance', 'Personal Projects', 'Education/Certifications', 'Family/Health', 'Career Break', 'Other']),
  explanation: z.string(),
  includeInResume: z.boolean().default(false),
});

export const DeclarationSchema = z.object({
  enabled: z.boolean().default(false),
  text: z.string().default('I hereby declare that all the information provided above is true and accurate to the best of my knowledge.'),
});

export const CandidateProfileSchema = z.object({
  profileTitle: z.string().default('Master Profile'),
  personalDetails: PersonalDetailsSchema,
  professionalSummary: z.string().default(''),
  education: z.array(EducationSchema).default([]),
  workExperience: z.array(WorkExperienceSchema).default([]),
  projects: z.array(ProjectSchema).default([]),
  skills: SkillsSchema.default({
    technicalSkills: [],
    jobSkills: [],
    computerSkills: [],
    languages: [],
    additionalSkills: [],
  }),
  certifications: z.array(CertificationSchema).default([]),
  businessExperience: z.array(BusinessExperienceSchema).default([]),
  currentOccupation: CurrentOccupationSchema.default({ status: 'Employed' }),
  careerGaps: z.array(CareerGapSchema).default([]),
  declaration: DeclarationSchema.default({
    enabled: false,
    text: 'I hereby declare that all the information provided above is true and accurate to the best of my knowledge.',
  }),
  uncategorizedInformation: z.array(z.string()).default([]),
});

// -----------------------------------------------------------------------------
// Resume Version Schemas
// -----------------------------------------------------------------------------
export const ResumeFormattingSchema = z.object({
  pageSize: z.enum(['A4', 'Letter']).default('A4'),
  fontFamily: z.enum(['Roboto', 'Inter', 'Arial', 'Times New Roman', 'Calibri', 'Georgia']).default('Roboto'),
  fontSizePt: z.number().min(8).max(14).default(10),
  lineSpacing: z.number().min(1.0).max(2.0).default(1.25),
  marginsMm: z.number().min(10).max(30).default(15),
  accentColor: z.string().default('#1e293b'),
});

export const ResumeVersionSchema = z.object({
  candidateProfileId: z.string(),
  title: z.string().min(1, 'Title is required').max(100),
  targetRole: z.string().optional().default(''),
  targetCategory: z.string().default('General'),
  templateId: z.string().default('classic-professional'),
  sectionOrder: z.array(z.string()).default([
    'summary',
    'skills',
    'experience',
    'projects',
    'education',
    'certifications',
    'declaration',
  ]),
  sectionVisibility: z.record(z.boolean()).default({}),
  customContentOverrides: z.record(z.any()).default({}),
  formatting: ResumeFormattingSchema.default({
    pageSize: 'A4',
    fontFamily: 'Roboto',
    fontSizePt: 10,
    lineSpacing: 1.25,
    marginsMm: 15,
    accentColor: '#1e293b',
  }),
});

// -----------------------------------------------------------------------------
// Job Description Schema
// -----------------------------------------------------------------------------
export const JobDescriptionInputSchema = z.object({
  jobTitle: z.string().min(1, 'Job title is required'),
  companyName: z.string().optional().default(''),
  rawText: z.string().min(30, 'Job description text must be at least 30 characters'),
});
