import express from "express";
import { getInvitations, inviteUser, acceptInvite } from "../controllers/invitationController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import allowRoles from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, allowRoles("ADMIN"), getInvitations);
router.post("/invite", authMiddleware, allowRoles("ADMIN"), inviteUser);
router.post("/accept/:token", acceptInvite);

export default router;