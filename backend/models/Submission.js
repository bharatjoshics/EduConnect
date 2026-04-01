import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  url: String,
  public_id: String,
  pageNumber: Number,
  hash: String // 🔥 move here
});

const submissionSchema = new mongoose.Schema({
  files: [fileSchema],

  excelFile: String,
  pdfFile: String,
  lastProcessedHash: String,
  aiData: Array,
  uploadedBy: {
    type: String,
    enum: ["school", "staff"],
    default: "school"
  },
  schoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // ✅ rename for frontend consistency
  taskType: String,

  // ✅ add message
  message: {
    type: String,
    default: ""
  },

  status: {
    type: String,
    enum: ["Pending", "Working", "Done"],
    default: "Pending"
  }

}, { timestamps: true });

export default mongoose.model("Submission", submissionSchema);