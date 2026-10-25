import mongoose, { Document, Schema } from 'mongoose';

export interface IUploadedDocumentModel extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  storagePath: string;
  processingStatus: 'uploaded' | 'processing' | 'parsed' | 'failed';
  extractedText?: string;
  parsedProfileSnapshot?: Record<string, unknown>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UploadedDocumentSchema = new Schema<IUploadedDocumentModel>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFileName: { type: String, required: true },
    mimeType: { type: String, required: true },
    fileSizeBytes: { type: Number, required: true },
    storagePath: { type: String, required: true },
    processingStatus: {
      type: String,
      enum: ['uploaded', 'processing', 'parsed', 'failed'],
      default: 'uploaded',
    },
    extractedText: { type: String, default: '' },
    parsedProfileSnapshot: { type: Schema.Types.Mixed, default: null },
    errorMessage: { type: String, default: null },
  },
  { timestamps: true }
);

export const UploadedDocument = mongoose.model<IUploadedDocumentModel>(
  'UploadedDocument',
  UploadedDocumentSchema
);
