import express from "express";
import { getUserBoards, createBoard } from "../controllers/board.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js"; 

const router = express.Router();

router.get("/:userId", getUserBoards);
router.post("/", verifyToken, createBoard);

export default router;