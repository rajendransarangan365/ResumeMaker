import mongoose, { Document, Schema } from 'mongoose';
import { AIFeature } from '@ats/shared-types';

export interface IAIUsageLogDocument {
  userId: mongoose.Types.ObjectId;
  feature: AIFeature;
  model: string;
  promptTokens: number;
  candidatesTokens: number;
  totalTokens: number;
  durationMs: number;
  success: boolean;
  errorCategory?: string;
  estimatedCostUsd: number;
  createdAt: Date;
}

const AIUsageLogSchema = new Schema<IAIUsageLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    feature: { type: String, required: true },
    model: { type: String, required: true },
    promptTokens: { type: Number, default: 0 },
    candidatesTokens: { type: Number, default: 0 },
    totalTokens: { type: Number, default: 0 },
    durationMs: { type: Number, default: 0 },
    success: { type: Boolean, default: true },
    errorCategory: { type: String, default: null },
    estimatedCostUsd: { type: Number, default: 0 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AIUsageLogSchema.index({ createdAt: 1 });
AIUsageLogSchema.index({ userId: 1, createdAt: -1 });

export const AIUsageLog = mongoose.model<IAIUsageLogDocument>('AIUsageLog', AIUsageLogSchema);
