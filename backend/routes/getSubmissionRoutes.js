import express from "express";
import { getMySubmissions, getAllSubmissions, getReceivedFiles, updateSubmissionStatus, getTaskTypes, getDashboardData } from "../controllers/getSubmissionController.js";
import { protect } from "../middleware/auth.js";
import { isStaff } from "../middleware/role.js";
import User from "../models/User.js";

const router = express.Router();

// ✅ school dashboard
router.get("/dashboard", protect, getDashboardData);

router.get("/my", protect, getMySubmissions);

// Given By Staff
router.get("/received", protect, getReceivedFiles);

// staff (already exists)
router.get("/all",protect, isStaff, getAllSubmissions);

router.get("/schools", protect, async (req, res) => {
  try {
    const schools = await User.find({ role: "school" })
      .select("_id name");

    res.json(schools);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put("/:id/status", updateSubmissionStatus);

router.get("/task-types", getTaskTypes);

export default router;