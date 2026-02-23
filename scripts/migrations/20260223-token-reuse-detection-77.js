#!/usr/bin/env node
import crypto from 'node:crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGO_URI or MONGODB_URI is required');
  process.exit(1);
}

const randomId = () => crypto.randomUUID();

const run = async () => {
  await mongoose.connect(MONGODB_URI);
  const refreshTokens = mongoose.connection.collection('refreshtokens');

  const cursor = refreshTokens.find({
    $or: [
      { status: { $exists: false } },
      { familyId: { $exists: false } },
      { jti: { $exists: false } },
      { revokedReason: { $exists: false } },
      { usedAt: { $exists: false } },
      { parentJti: { $exists: false } },
      { replacedByJti: { $exists: false } },
    ],
  });

  let scanned = 0;
  let updated = 0;

  while (await cursor.hasNext()) {
    const doc = await cursor.next();
    scanned += 1;

    const set = {};
    if (!doc.status) {
      set.status = doc.revokedAt ? 'revoked' : 'active';
    }
    if (doc.revokedReason === undefined) {
      set.revokedReason = doc.revokedAt ? 'legacy_revoked' : null;
    }
    if (doc.usedAt === undefined) {
      set.usedAt = null;
    }
    if (doc.parentJti === undefined) {
      set.parentJti = null;
    }
    if (doc.replacedByJti === undefined) {
      set.replacedByJti = null;
    }
    if (!doc.familyId) {
      set.familyId = randomId();
    }
    if (!doc.jti) {
      set.jti = randomId();
    }

    if (Object.keys(set).length > 0) {
      await refreshTokens.updateOne({ _id: doc._id }, { $set: set });
      updated += 1;
    }
  }

  await refreshTokens.createIndex({ userId: 1, status: 1 });
  await refreshTokens.createIndex({ familyId: 1, status: 1 });
  await refreshTokens.createIndex({ jti: 1 }, { unique: true, sparse: true });

  const securityEvents = mongoose.connection.collection('securityevents');
  await securityEvents.createIndex({ eventType: 1 });
  await securityEvents.createIndex({ userId: 1 });
  await securityEvents.createIndex({ occurredAt: 1 });

  console.log(`Done. scanned=${scanned}, updated=${updated}`);
  await mongoose.disconnect();
};

run().catch(async (err) => {
  console.error('Migration failed:', err);
  try {
    await mongoose.disconnect();
  } catch {
    // ignore disconnect errors on failure
  }
  process.exit(1);
});
