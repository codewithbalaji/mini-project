import express from "express";
import { createDepartment } from "../controllers/departmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, createDepartment);

export default router;