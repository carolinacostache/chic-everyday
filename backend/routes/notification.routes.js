import express from "express";
import { getNotifications,
     markAsRead,
     markAllAsRead
    } from "../controllers/notification.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();

router.get("/", verifyToken, getNotifications);
router.put("/:id/read", verifyToken, markAsRead);
router.put("/read-all", verifyToken, markAllAsRead);

export default router;