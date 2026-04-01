import express from "express";
import { protect } from "../middleware/auth.js";
import { isStaff } from "../middleware/role.js";
import { getMessages, sendMessage, getSchools, getStaffForSchool, getUnreadCounts } from "../controllers/chatController.js";

const router = express.Router();

// get unread count
router.get("/unread", protect, getUnreadCounts);

// get first staff (school only)
router.get("/staff", protect, getStaffForSchool);

// get all schools (staff only)
router.get("/schools", protect, isStaff, getSchools);


// get messages between current user & another user
router.get("/:id", protect, getMessages);

// send message
router.post("/send", protect, sendMessage);



export default router;