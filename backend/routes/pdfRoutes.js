import express from "express";
import { downloadPDF } from "../controllers/pdfController.js";
import { protect } from "../middleware/auth.js";
import { isStaff } from "../middleware/role.js";

const router = express.Router();

router.get("/:id", protect, isStaff, downloadPDF);

export default router;