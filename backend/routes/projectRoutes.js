import express from "express";
import {
  createProject,
  getProjects,
  getProjectById,
  updateProject,
  deleteProject,
  addProjectMember,
  removeProjectMember,
  getProjectStats
} from "../controllers/projectController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", allowRoles("ADMIN", "MANAGER"), createProject);
router.get("/", getProjects);
router.get("/:id", getProjectById);
router.put("/:id", allowRoles("ADMIN", "MANAGER"), updateProject);
router.delete("/:id", allowRoles("ADMIN"), deleteProject);
router.post("/:id/members", allowRoles("ADMIN", "MANAGER"), addProjectMember);
router.delete("/:id/members/:userId", allowRoles("ADMIN", "MANAGER"), removeProjectMember);
router.get("/:id/stats", getProjectStats);

export default router;
