/**
 * ATS Resume Intelligence Studio - Shared Types
 */

// -----------------------------------------------------------------------------
// Authentication & Security
// -----------------------------------------------------------------------------
export type UserRole = 'user' | 'admin';
export type AccountStatus = 'active' | 'suspended' | 'pending_verification';

export interface IUser {
  id: string;
  fullName: string;
  email: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: string | null;
  role: UserRole;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export type ChallengeType = 'email_verification' | 'password_reset' | 'email_change';

export interface IAuthChallenge {
  id: string;
  email: string;
  challengeType: ChallengeType;
  expiresAt: string;
  failedAttempts: number;
  maxAttempts: number;
  isConsumed: boolean;
}

export interface ISecurityAuditLog {
  id: string;
  userId?: string;
  ipAddress: string;
  userAgent: string;
  action: string;
  status: 'success' | 'failure' | 'blocked';
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// Candidate Profile
// -----------------------------------------------------------------------------
export interface IPersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  headline?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  preferredLocation?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface IEducation {
  id: string;
  qualification: string;
  specialization?: string;
  institution: string;
  universityBoard?: string;
  startDate?: string;
  endDate?: string;
  gradePercentageCgpa?: string;
  academicAchievements?: string[];
  coursework?: string[];
  includeInResume: boolean;
}

export type EmploymentType = 'Full-time' | 'Part-time' | 'Contract' | 'Freelance' | 'Internship' | 'Apprenticeship' | 'Business / Founder';

export interface IWorkExperience {
  id: string;
  employer: string;
  jobTitle: string;
  employmentType: EmploymentType;
  location?: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  duration?: string;
  responsibilities: string[];
  achievements?: string[];
  technologies?: string[];
  includeInResume: boolean;
}

export type ProjectCategory = 'Academic' | 'Professional' | 'Personal' | 'Open-Source';

export interface IProject {
  id: string;
  name: string;
  category: ProjectCategory;
  role?: string;
  startDate?: string;
  endDate?: string;
  description: string;
  responsibilities?: string[];
  technologies: string[];
  url?: string;
  githubUrl?: string;
  includeInResume: boolean;
}

export interface ILanguage {
  name: string;
  proficiency: 'Basic' | 'Conversational' | 'Professional' | 'Native/Bilingual';
}

export interface ISkills {
  technicalSkills: string[];
  jobSkills: string[];
  computerSkills: string[];
  languages: ILanguage[];
  additionalSkills: string[];
}

export interface ICertification {
  id: string;
  title: string;
  issuer: string;
  issueDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  includeInResume: boolean;
}

export interface IBusinessExperience {
  id: string;
  businessName: string;
  industry?: string;
  role: string;
  duration?: string;
  responsibilities: string[];
  includeInResume: boolean;
}

export type CurrentOccupationStatus =
  | 'Employed'
  | 'Self-employed'
  | 'Freelancer'
  | 'Business Owner'
  | 'Student'
  | 'Job Seeker'
  | 'Career Break'
  | 'Other';

export interface ICurrentOccupation {
  status: CurrentOccupationStatus;
  notes?: string;
}

export type CareerGapReason =
  | 'Freelance'
  | 'Personal Projects'
  | 'Education/Certifications'
  | 'Family/Health'
  | 'Career Break'
  | 'Other';

export interface ICareerGap {
  id: string;
  startDate: string;
  endDate: string;
  reasonCategory: CareerGapReason;
  explanation: string;
  includeInResume: boolean;
}

export interface IDeclaration {
  enabled: boolean;
  text: string;
}

export interface ICandidateProfile {
  id: string;
  userId: string;
  profileTitle: string;
  personalDetails: IPersonalDetails;
  professionalSummary: string;
  education: IEducation[];
  workExperience: IWorkExperience[];
  projects: IProject[];
  skills: ISkills;
  certifications: ICertification[];
  businessExperience: IBusinessExperience[];
  currentOccupation: ICurrentOccupation;
  careerGaps: ICareerGap[];
  declaration: IDeclaration;
  uncategorizedInformation: string[];
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Resume Versions & Formatting
// -----------------------------------------------------------------------------
export type PageSize = 'A4' | 'Letter';
export type FontFamily = 'Roboto' | 'Inter' | 'Arial' | 'Times New Roman' | 'Calibri' | 'Georgia';

export interface IResumeFormatting {
  pageSize: PageSize;
  fontFamily: FontFamily;
  fontSizePt: number;
  lineSpacing: number;
  marginsMm: number;
  accentColor: string;
}

export interface IResumeVersion {
  id: string;
  userId: string;
  candidateProfileId: string;
  title: string;
  targetRole?: string;
  targetCategory: string;
  templateId: string;
  sectionOrder: string[];
  sectionVisibility: Record<string, boolean>;
  customContentOverrides: Record<string, unknown>;
  formatting: IResumeFormatting;
  atsScore?: number;
  createdAt: string;
  updatedAt: string;
}

// -----------------------------------------------------------------------------
// Template Registry
// -----------------------------------------------------------------------------
export type TemplateId =
  | 'classic-professional'
  | 'modern-minimal'
  | 'corporate-standard'
  | 'technical-engineer'
  | 'software-developer'
  | 'fresher-graduate'
  | 'experienced-professional'
  | 'career-change'
  | 'administrative-support'
  | 'sales-customer-service'
  | 'electrical-instrumentation'
  | 'project-focused'
  | 'skills-focused'
  | 'academic-professional'
  | 'general-purpose'
  | 'modern-single-column'
  | 'minimal-professional'
  | 'corporate-professional'
  | 'graduate-entry'
  | 'technical-specialist'
  | 'senior-engineer'
  | 'executive-leadership'
  | 'marketing-professional'
  | 'customer-support'
  | 'finance-accounting'
  | 'healthcare-medical'
  | 'researcher-cv'
  | 'employment-gap-friendly'
  | 'international-professional'
  | 'ats-focused-hybrid';

export interface ITemplateDefinition {
  id: TemplateId;
  displayName: string;
  description: string;
  category: string;
  isAtsCompliant: boolean;
  defaultSectionOrder: string[];
  defaultFormatting: IResumeFormatting;
  headerStyle: 'standard' | 'centered' | 'compact' | 'split-accent';
  supportedCustomizations: string[];
}

// -----------------------------------------------------------------------------
// Job Description & AI Analysis
// -----------------------------------------------------------------------------
export type MatchStatus = 'Supported' | 'Partially Supported' | 'Needs Confirmation' | 'Not Found';

export interface IRequirementMatch {
  requirement: string;
  category: 'Technical' | 'Soft Skill' | 'Experience' | 'Education' | 'Certification';
  matchStatus: MatchStatus;
  candidateEvidence?: string;
  evidenceSource?: string;
  recommendation: string;
}

export interface IJobDescriptionAnalysis {
  id: string;
  userId: string;
  jobTitle: string;
  companyName?: string;
  rawText: string;
  requiredQualifications: string[];
  preferredQualifications: string[];
  requiredExperienceYears?: number;
  technicalSkills: string[];
  softwareTools: string[];
  responsibilities: string[];
  industryKnowledge: string[];
  softSkills: string[];
  locationRequirements?: string;
  matches?: IRequirementMatch[];
  keywordCoveragePercentage?: number;
  createdAt: string;
}

// -----------------------------------------------------------------------------
// AI Metering & Usage
// -----------------------------------------------------------------------------
export type AIFeature =
  | 'resume_parsing'
  | 'summary_generation'
  | 'jd_analysis'
  | 'candidate_matching'
  | 'bullet_optimization'
  | 'career_gap_assistant'
  | 'ats_evaluation';

export interface IAIUsageLog {
  id: string;
  userId: string;
  feature: AIFeature;
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  durationMs: number;
  success: boolean;
  errorCategory?: string;
  estimatedCostUsd: number;
  createdAt: string;
}

export interface IAIUsageSummary {
  requestsToday: number;
  requestsThisMonth: number;
  successfulRequests: number;
  failedRequests: number;
  totalTokensConsumed: number;
  totalEstimatedCostUsd: number;
  averageLatencyMs: number;
  rateLimitHits: number;
  monthlyBudgetLimit: number;
  budgetUtilizationPercentage: number;
}

// -----------------------------------------------------------------------------
// Document Upload & Parsing
// -----------------------------------------------------------------------------
export type ExtractionConfidence = 'Extracted' | 'Verified' | 'Needs Review' | 'Missing' | 'Not Applicable';

export interface IExtractedField<T> {
  value: T;
  confidence: ExtractionConfidence;
  sourceSnippet?: string;
  conflictDetected?: boolean;
  alternativeValues?: T[];
}

export interface IParsedResumeResult {
  personalDetails: Partial<Record<keyof IPersonalDetails, IExtractedField<string>>>;
  professionalSummary?: IExtractedField<string>;
  education: IExtractedField<IEducation[]>;
  workExperience: IExtractedField<IWorkExperience[]>;
  projects: IExtractedField<IProject[]>;
  skills: IExtractedField<ISkills>;
  certifications: IExtractedField<ICertification[]>;
  uncategorizedSnippets: string[];
  parsingErrors?: string[];
}

// -----------------------------------------------------------------------------
// Export Types
// -----------------------------------------------------------------------------
export type ExportFormat = 'pdf' | 'docx';

export interface IExportOptions {
  format: ExportFormat;
  includeAtsMetadata?: boolean;
}
