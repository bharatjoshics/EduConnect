import express from "express";
import { downloadTemplate } from "../controllers/templateController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();

router.get("/template", protect, downloadTemplate);

export default router;