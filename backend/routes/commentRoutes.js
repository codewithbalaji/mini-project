import express from "express";
import { addComment, getComments, deleteComment } from "../controllers/commentController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.post("/", addComment);
router.get("/", getComments);
router.delete("/:id", deleteComment);

export default router;
