import express from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

// read-all must come before /:id
router.put("/read-all", markAllAsRead);
router.get("/", getNotifications);
router.put("/:id/read", markAsRead);

export default router;
