import express from "express";
import { createSubmission, updateStatus } from "../controllers/submissionController.js";
import upload from "../middleware/upload.js";
import { protect } from "../middleware/auth.js";
import { isStaff } from "../middleware/role.js";

const router = express.Router();

// multiple file upload
router.post(
  "/create",
  protect,
  upload.array("files"),
  createSubmission
);

router.put(
  "/:id/status",
  protect,
  isStaff,
  updateStatus
);

export default router;