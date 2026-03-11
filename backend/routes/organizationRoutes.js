import express from "express";
import {
  getOrganization,
  updateOrganization
} from "../controllers/organizationController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  getOrganization
);

router.put(
  "/",
  authMiddleware,
  allowRoles("ADMIN"),
  updateOrganization
);

export default router;