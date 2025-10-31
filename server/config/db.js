// server/config/db.js
import mongoose from "mongoose";

export async function connectDB(mongoUri) {
  const uri = mongoUri || "mongodb://127.0.0.1:27017/todo_api";
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}