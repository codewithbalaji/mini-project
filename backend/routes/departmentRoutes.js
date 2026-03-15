import express from "express";
import { getDepartments, createDepartment, updateDepartment } from "../controllers/departmentController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getDepartments);
router.post("/", authMiddleware, allowRoles("ADMIN"), createDepartment);
router.put("/:id", authMiddleware, allowRoles("ADMIN"), updateDepartment);

export default router;