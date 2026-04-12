import express from "express";
import {
  getUsers,
  updateUserRole,
  updateUserDepartment,
  deactivateUser
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN", "MANAGER"), getUsers);

router.put(
  "/:id/role",
  authMiddleware,
  allowRoles("ADMIN"),
  updateUserRole
);

router.put(
  "/:id/department",
  authMiddleware,
  allowRoles("ADMIN", "MANAGER"),
  updateUserDepartment
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  deactivateUser
);

export default router;