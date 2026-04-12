import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";
import { generateReport, getReports, deleteReport } from "../controllers/reportController.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/generate", allowRoles("ADMIN", "MANAGER"), generateReport);
router.get("/", allowRoles("ADMIN", "MANAGER"), getReports);
router.delete("/:id", allowRoles("ADMIN", "MANAGER"), deleteReport);

export default router;
