import express from "express";
import { getOrgDashboard, getProjectDashboard, getMyDashboard, getAnalyticsDashboard } from "../controllers/dashboardController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/org", allowRoles("ADMIN", "MANAGER", "VIEWER"), getOrgDashboard);
router.get("/analytics", allowRoles("ADMIN", "MANAGER", "VIEWER"), getAnalyticsDashboard);
router.get("/project/:id", allowRoles("ADMIN", "MANAGER", "VIEWER"), getProjectDashboard);
router.get("/me", allowRoles("ADMIN", "MANAGER", "EMPLOYEE"), getMyDashboard);

export default router;
