import express from "express";
import { getDepartments, createDepartment } from "../controllers/departmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getDepartments);
router.post("/", authMiddleware, createDepartment);

export default router;