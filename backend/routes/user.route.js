import express from "express";
import {
  getUser,
  registerUser,
  submitShopApplication,
  loginUser,
  logoutUser,
  followUser,
  getUserFollowers,
  getUserFollowing,
  searchUsers,
  getPendingApplications,
  approveShop,
  rejectShop,
} from "../controllers/user.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";

const router = express.Router();

router.get("/search", searchUsers);

router.get("/:username", getUser);
router.post("/auth/register", registerUser);
router.post("/apply-shop", verifyToken, submitShopApplication);
router.get("/admin/pending-shops", verifyToken, verifyAdmin, getPendingApplications);
router.put("/admin/approve-shop", verifyToken, verifyAdmin, approveShop);
router.put("/admin/reject-shop", verifyToken, verifyAdmin, rejectShop);
router.post("/auth/login", loginUser);
router.post("/auth/logout", logoutUser);
router.post("/follow/:username", verifyToken, followUser);


router.get("/:userId/followers", getUserFollowers);
router.get("/:userId/following", getUserFollowing);

export default router;