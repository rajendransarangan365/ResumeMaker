import mongoose, { Document, Schema } from 'mongoose';
import { UserRole, AccountStatus } from '@ats/shared-types';

export interface IUserDocument extends Document {
  fullName: string;
  email: string;
  passwordHash: string;
  isEmailVerified: boolean;
  emailVerifiedAt?: Date | null;
  role: UserRole;
  status: AccountStatus;
  securityQuestion?: {
    question: string;
    answerHash: string;
  };
  passwordChangedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUserDocument>(
  {
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    isEmailVerified: { type: Boolean, default: false },
    emailVerifiedAt: { type: Date, default: null },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: String, enum: ['active', 'suspended', 'pending_verification'], default: 'pending_verification' },
    securityQuestion: {
      question: { type: String, default: null },
      answerHash: { type: String, default: null },
    },
    passwordChangedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes
UserSchema.index({ email: 1 }, { unique: true });

export const User = mongoose.model<IUserDocument>('User', UserSchema);
