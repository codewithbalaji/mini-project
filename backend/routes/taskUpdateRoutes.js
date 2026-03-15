import express from "express";
import { submitUpdate, getUpdatesForTask } from "../controllers/taskUpdateController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", submitUpdate);
router.get("/:taskId", getUpdatesForTask);

export default router;
