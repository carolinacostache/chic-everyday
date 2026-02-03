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
  participateContest,
  getContestEntries,
  toggleContestEntryLike, // ✅ NOU
  getContestWinner,       // ✅ NOU
} from "../controllers/pin.controller.js";

import { verifyToken, verifyTokenOptional } from "../middlewares/verifyToken.js";
import { getTagsData } from "../controllers/admin.controller.js";

const router = express.Router();

router.get("/tags", verifyToken, getTagsData);

router.get("/", verifyTokenOptional, getPins);

// IMPORTANT: rutele mai specifice inainte de "/:id"
router.get("/:id/entries", getContestEntries);

// ✅ like/unlike pe o inscriere (contest entry)
router.post("/:id/entries/:entryId/like", verifyToken, toggleContestEntryLike);

// ✅ winner (cea mai votata inscriere)
router.get("/:id/winner", getContestWinner);

router.get("/:id", getPin);
router.post("/", verifyToken, createPin);

router.get("/interaction-check/:id", interactionCheck);
router.post("/interact/:id", verifyToken, interact);

router.patch("/:id", verifyToken, updatePin);
router.delete("/:id", verifyToken, deletePin);

router.put("/:id/view", viewPin);
router.put("/:id/click", clickPinLink);

router.get("/stats/shop", verifyToken, getShopStats);

// concurs: participare (upload poza + comentariu optional)
router.post("/:id/participate", verifyToken, participateContest);

export default router;