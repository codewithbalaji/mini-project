import express from "express";
import {
  createTask,
  getTasks,
  getMyTasks,
  getTaskById,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// my-tasks must come before /:id to avoid param conflict
router.get("/my-tasks", allowRoles("ADMIN", "MANAGER", "EMPLOYEE"), getMyTasks);

router.post("/", allowRoles("ADMIN", "MANAGER"), createTask);
router.get("/", getTasks);
router.get("/:id", getTaskById);
router.put("/:id", allowRoles("ADMIN", "MANAGER", "EMPLOYEE"), updateTask);
router.delete("/:id", allowRoles("ADMIN", "MANAGER"), deleteTask);

export default router;
