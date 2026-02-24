import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const securityEventSchema = new Schema(
  {
    eventType: { type: String, required: true, index: true },
    userId: { type: String, required: true, index: true },
    jti: { type: String, default: null, index: true },
    familyId: { type: String, default: null, index: true },
    ip: { type: String, default: null },
    userAgent: { type: String, default: null },
    occurredAt: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed, default: null },
  },
  { timestamps: true }
);

export default model('SecurityEvent', securityEventSchema);
