// server/models/refreshToken.js
import mongoose from 'mongoose';

const { Schema, model } = mongoose;

const refreshTokenSchema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    jti: { type: String, required: true, unique: true, index: true },
    familyId: { type: String, required: true, index: true },
    parentJti: { type: String, default: null },
    replacedByJti: { type: String, default: null },
    tokenHash: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      enum: ['active', 'rotated', 'revoked'],
      default: 'active',
      index: true,
    },
    revokedReason: { type: String, default: null },
    usedAt: { type: Date, default: null },
    revokedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

refreshTokenSchema.index({ userId: 1, revokedAt: 1 });
refreshTokenSchema.index({ userId: 1, status: 1 });
refreshTokenSchema.index({ familyId: 1, status: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default model('RefreshToken', refreshTokenSchema);
