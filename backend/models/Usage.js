import mongoose from "mongoose";

const usageSchema = new mongoose.Schema({
  userId: String,
  model: String,
  promptTokens: Number,
  completionTokens: Number,
  totalTokens: Number,
  cost: Number,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Usage", usageSchema);