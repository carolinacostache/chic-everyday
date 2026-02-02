import express from "express";
import {
  getPins,
  getPin,
  createPin,
  interactionCheck,
  interact,
  updatePin,
  deletePin,
  viewPin,
  clickPinLink,
  getShopStats,
} from "../controllers/pin.controller.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { getTagsData } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/tags", verifyToken, getTagsData);

router.get("/", getPins);
router.get("/:id", getPin);
router.post("/", verifyToken, createPin);
router.get("/interaction-check/:id", interactionCheck);
router.post("/interact/:id", verifyToken, interact);

router.patch("/:id", verifyToken, updatePin); 
router.delete("/:id", verifyToken, deletePin); 

router.put("/:id/view", viewPin); 
router.put("/:id/click", clickPinLink); 
router.get("/stats/shop", verifyToken, getShopStats);

export default router;