import express from "express";
import {
  getUsers,
  updateUserRole,
  deactivateUser
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN"), getUsers);

router.put(
  "/:id/role",
  authMiddleware,
  allowRoles("ADMIN"),
  updateUserRole
);

router.delete(
  "/:id",
  authMiddleware,
  allowRoles("ADMIN"),
  deactivateUser
);

export default router;