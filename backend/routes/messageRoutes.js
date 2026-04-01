import express from "express";
import { sendMessage, getMessages } from "../controllers/chatController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.post("/send", protect, sendMessage);
router.get("/:submissionId", protect, getMessages);

export default router;