import mongoose, { Document, Schema } from 'mongoose';
import {
  IPersonalDetails,
  IEducation,
  IWorkExperience,
  IProject,
  ISkills,
  ICertification,
  IBusinessExperience,
  ICurrentOccupation,
  ICareerGap,
  IDeclaration,
} from '@ats/shared-types';

export interface ICandidateProfileDocument extends Document {
  userId: mongoose.Types.ObjectId;
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
  createdAt: Date;
  updatedAt: Date;
}

const PersonalDetailsSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, default: '' },
    headline: { type: String, default: '' },
    address: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: '' },
    postalCode: { type: String, default: '' },
    preferredLocation: { type: String, default: '' },
    linkedinUrl: { type: String, default: '' },
    githubUrl: { type: String, default: '' },
    portfolioUrl: { type: String, default: '' },
  },
  { _id: false }
);

const EducationSchema = new Schema(
  {
    id: { type: String, required: true },
    qualification: { type: String, required: true },
    specialization: { type: String, default: '' },
    institution: { type: String, required: true },
    universityBoard: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    gradePercentageCgpa: { type: String, default: '' },
    academicAchievements: [{ type: String }],
    coursework: [{ type: String }],
    includeInResume: { type: Boolean, default: true },
  },
  { _id: false }
);

const WorkExperienceSchema = new Schema(
  {
    id: { type: String, required: true },
    employer: { type: String, required: true },
    jobTitle: { type: String, required: true },
    employmentType: { type: String, default: 'Full-time' },
    location: { type: String, default: '' },
    startDate: { type: String, required: true },
    endDate: { type: String, default: 'Present' },
    isCurrent: { type: Boolean, default: false },
    duration: { type: String, default: '' },
    responsibilities: [{ type: String }],
    achievements: [{ type: String }],
    technologies: [{ type: String }],
    includeInResume: { type: Boolean, default: true },
  },
  { _id: false }
);

const ProjectSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    category: { type: String, default: 'Professional' },
    role: { type: String, default: '' },
    startDate: { type: String, default: '' },
    endDate: { type: String, default: '' },
    description: { type: String, default: '' },
    responsibilities: [{ type: String }],
    technologies: [{ type: String }],
    url: { type: String, default: '' },
    includeInResume: { type: Boolean, default: true },
  },
  { _id: false }
);

const SkillsSchema = new Schema(
  {
    technicalSkills: [{ type: String }],
    jobSkills: [{ type: String }],
    computerSkills: [{ type: String }],
    languages: [
      {
        name: { type: String },
        proficiency: { type: String },
        _id: false,
      },
    ],
    additionalSkills: [{ type: String }],
  },
  { _id: false }
);

const CertificationSchema = new Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
    issuer: { type: String, required: true },
    issueDate: { type: String, default: '' },
    credentialId: { type: String, default: '' },
    credentialUrl: { type: String, default: '' },
    includeInResume: { type: Boolean, default: true },
  },
  { _id: false }
);

const BusinessExperienceSchema = new Schema(
  {
    id: { type: String, required: true },
    businessName: { type: String, required: true },
    industry: { type: String, default: '' },
    role: { type: String, required: true },
    duration: { type: String, default: '' },
    responsibilities: [{ type: String }],
    includeInResume: { type: Boolean, default: true },
  },
  { _id: false }
);

const CareerGapSchema = new Schema(
  {
    id: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reasonCategory: { type: String, required: true },
    explanation: { type: String, required: true },
    includeInResume: { type: Boolean, default: false },
  },
  { _id: false }
);

const CandidateProfileSchema = new Schema<ICandidateProfileDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    profileTitle: { type: String, default: 'Master Profile' },
    personalDetails: { type: PersonalDetailsSchema, required: true },
    professionalSummary: { type: String, default: '' },
    education: [EducationSchema],
    workExperience: [WorkExperienceSchema],
    projects: [ProjectSchema],
    skills: {
      type: SkillsSchema,
      default: () => ({
        technicalSkills: [],
        jobSkills: [],
        computerSkills: [],
        languages: [],
        additionalSkills: [],
      }),
    },
    certifications: [CertificationSchema],
    businessExperience: [BusinessExperienceSchema],
    currentOccupation: {
      status: { type: String, default: 'Employed' },
      notes: { type: String, default: '' },
    },
    careerGaps: [CareerGapSchema],
    declaration: {
      enabled: { type: Boolean, default: false },
      text: {
        type: String,
        default:
          'I hereby declare that all the information provided above is true and accurate to the best of my knowledge.',
      },
    },
    uncategorizedInformation: [{ type: String }],
  },
  { timestamps: true }
);

export const CandidateProfile = mongoose.model<ICandidateProfileDocument>(
  'CandidateProfile',
  CandidateProfileSchema
);
