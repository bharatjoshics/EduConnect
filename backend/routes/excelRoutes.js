import express from "express";
import { downloadExcel } from "../controllers/excelController.js";
import { protect } from "../middleware/auth.js";
import { isStaff } from "../middleware/role.js";

const router = express.Router();

router.get("/:id", protect, isStaff, downloadExcel);

export default router;