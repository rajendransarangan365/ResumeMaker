import mongoose, { Document, Schema } from 'mongoose';

export interface ISecurityAuditLogDocument extends Document {
  userId?: mongoose.Types.ObjectId;
  ipAddress: string;
  userAgent: string;
  action: string;
  status: 'success' | 'failure' | 'blocked';
  metadata: Record<string, unknown>;
  createdAt: Date;
}

const SecurityAuditLogSchema = new Schema<ISecurityAuditLogDocument>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: false, index: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, default: '' },
    action: { type: String, required: true, index: true },
    status: { type: String, enum: ['success', 'failure', 'blocked'], required: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

SecurityAuditLogSchema.index({ createdAt: -1 });

export const SecurityAuditLog = mongoose.model<ISecurityAuditLogDocument>(
  'SecurityAuditLog',
  SecurityAuditLogSchema
);
