import mongoose, { Document, Schema } from 'mongoose';

export interface IStretchedField {
  field: string;
  section: string;
  originalValue: string;
  enhancedValue: string;
  riskLevel: 'low' | 'medium' | 'high';
  interviewTip: string;
}

export interface IInterviewQuestion {
  question: string;
  suggestedAnswer: string;
  relatedField: string;
  category: 'behavioral' | 'technical' | 'experience' | 'situational';
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface IJobApplicationDocument extends Document {
  userId: mongoose.Types.ObjectId;
  resumeId?: mongoose.Types.ObjectId;
  jobTitle: string;
  companyName: string;
  jdText: string;
  appliedDate: Date;
  status: 'draft' | 'applied' | 'shortlisted' | 'interview' | 'offered' | 'rejected' | 'withdrawn';
  atsScore: number;
  matchScore: number;
  stretchedFields: IStretchedField[];
  interviewPrepQuestions: IInterviewQuestion[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const StretchedFieldSchema = new Schema(
  {
    field: { type: String, required: true },
    section: { type: String, required: true },
    originalValue: { type: String, default: '' },
    enhancedValue: { type: String, default: '' },
    riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
    interviewTip: { type: String, default: '' },
  },
  { _id: false }
);

const InterviewQuestionSchema = new Schema(
  {
    question: { type: String, required: true },
    suggestedAnswer: { type: String, default: '' },
    relatedField: { type: String, default: '' },
    category: { type: String, enum: ['behavioral', 'technical', 'experience', 'situational'], default: 'technical' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  },
  { _id: false }
);

const JobApplicationSchema = new Schema<IJobApplicationDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resumeId: { type: Schema.Types.ObjectId, ref: 'ResumeVersion' },
    jobTitle: { type: String, required: true },
    companyName: { type: String, default: '' },
    jdText: { type: String, default: '' },
    appliedDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['draft', 'applied', 'shortlisted', 'interview', 'offered', 'rejected', 'withdrawn'],
      default: 'applied',
    },
    atsScore: { type: Number, default: 0 },
    matchScore: { type: Number, default: 0 },
    stretchedFields: [StretchedFieldSchema],
    interviewPrepQuestions: [InterviewQuestionSchema],
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export const JobApplication = mongoose.model<IJobApplicationDocument>(
  'JobApplication',
  JobApplicationSchema
);
