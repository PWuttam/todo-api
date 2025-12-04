// server/config/db.js
import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI が設定されていません (.env / .env.docker を確認)');
    process.exit(1);
  }

  mongoose.set('strictQuery', true);

  try {
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB:', uri);
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    throw error;
  }
}
