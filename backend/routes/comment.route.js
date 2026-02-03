import express from "express";
import { getPostComments, addComment } from "../controllers/comment.controller.js";
import { verifyToken, verifyTokenOptional } from "../middlewares/verifyToken.js";

const router = express.Router();

// ✅ IMPORTANT: ca sa putem calcula likedByMe cand userul e logat,
// dar sa mearga si cand NU e logat
router.get("/:postId", verifyTokenOptional, getPostComments);

router.post("/", verifyToken, addComment);

export default router;