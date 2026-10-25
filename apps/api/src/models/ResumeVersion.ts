import mongoose, { Document, Schema } from 'mongoose';
import { IResumeFormatting } from '@ats/shared-types';

export interface IResumeVersionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  candidateProfileId: mongoose.Types.ObjectId;
  title: string;
  targetRole?: string;
  targetCategory: string;
  templateId: string;
  sectionOrder: string[];
  sectionVisibility: Map<string, boolean>;
  customContentOverrides: Record<string, unknown>;
  formatting: IResumeFormatting;
  atsScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

const FormattingSchema = new Schema(
  {
    pageSize: { type: String, enum: ['A4', 'Letter'], default: 'A4' },
    fontFamily: { type: String, default: 'Roboto' },
    fontSizePt: { type: Number, default: 10 },
    lineSpacing: { type: Number, default: 1.25 },
    marginsMm: { type: Number, default: 15 },
    accentColor: { type: String, default: '#1e293b' },
  },
  { _id: false }
);

const ResumeVersionSchema = new Schema<IResumeVersionDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    candidateProfileId: {
      type: Schema.Types.ObjectId,
      ref: 'CandidateProfile',
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    targetRole: { type: String, default: '' },
    targetCategory: { type: String, default: 'General' },
    templateId: { type: String, required: true, default: 'classic-professional' },
    sectionOrder: [{ type: String }],
    sectionVisibility: { type: Map, of: Boolean, default: {} },
    customContentOverrides: { type: Schema.Types.Mixed, default: {} },
    formatting: { type: FormattingSchema, default: () => ({}) },
    atsScore: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const ResumeVersion = mongoose.model<IResumeVersionDocument>(
  'ResumeVersion',
  ResumeVersionSchema
);
