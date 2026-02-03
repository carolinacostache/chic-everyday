import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { verifyAdmin } from "../middlewares/verifyAdmin.js";
import { 
  getAdminStats,
  getAllUsers, 
  adminDeleteUser, 
  adminDeletePin, 
  adminDeleteComment,
  getTagsData, 
  addWeatherTag, 
  deleteWeatherTag, 
  deleteUserTag,
  getAllBoards,
  adminDeleteBoard,
  approveShop,
  rejectShop,
  adminUpdateUserRole,
} from "../controllers/admin.controller.js";

const router = express.Router();

router.use(verifyToken, verifyAdmin);

router.get("/stats", getAdminStats);

router.get("/users", getAllUsers);
router.put("/user/:id/ban", verifyToken, verifyAdmin, adminDeleteUser);
router.put("/users/:id", adminUpdateUserRole);

router.delete("/pins/:id", adminDeletePin);
router.delete("/comments/:id", adminDeleteComment);


router.get("/tags", getTagsData);
router.post("/tags/weather", addWeatherTag);
router.delete("/tags/weather/:id", deleteWeatherTag);
router.put("/tags/user/delete", deleteUserTag);

router.get("/boards", getAllBoards);
router.delete("/boards/:id", adminDeleteBoard);

router.put("/shops/approve/:id", approveShop);
router.put("/shops/reject/:id", rejectShop);


export default router;