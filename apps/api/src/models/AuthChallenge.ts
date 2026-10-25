import mongoose, { Document, Schema } from 'mongoose';
import { ChallengeType } from '@ats/shared-types';

export interface IAuthChallengeDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  email: string;
  challengeType: ChallengeType;
  hashedCode: string;
  expiresAt: Date;
  failedAttempts: number;
  maxAttempts: number;
  isConsumed: boolean;
  createdAt: Date;
}

const AuthChallengeSchema = new Schema<IAuthChallengeDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    email: { type: String, required: true, lowercase: true, trim: true },
    challengeType: {
      type: String,
      enum: ['email_verification', 'password_reset', 'email_change'],
      required: true,
    },
    hashedCode: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: { expires: '1h' } }, // MongoDB TTL cleanup
    failedAttempts: { type: Number, default: 0 },
    maxAttempts: { type: Number, default: 5 },
    isConsumed: { type: Boolean, default: false },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

AuthChallengeSchema.index({ email: 1, challengeType: 1, isConsumed: 1 });

export const AuthChallenge = mongoose.model<IAuthChallengeDocument>(
  'AuthChallenge',
  AuthChallengeSchema
);
