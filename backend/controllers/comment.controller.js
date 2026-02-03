import Comment from "../models/comment.model.js";
import ContestEntry from "../models/contestEntry.model.js";
import Pin from "../models/pin.model.js";
import Notification from "../models/notification.model.js";
import { checkBadges } from "../utils/gamification.js";

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    // daca nu e logat, req.userId poate fi undefined
    const me = req.userId ? req.userId.toString() : null;

    // 1) comentarii text normale
    const comments = await Comment.find({ pin: postId })
      .populate("user", "username img displayName")
      .sort({ createdAt: -1 })
      .lean();

    const textComments = comments
      .filter((c) => c.user)
      .map((c) => ({
        _id: c._id,
        type: "comment",
        description: c.description,
        img: c.img || null, // daca ai comment.img (optional), ramane
        user: c.user,
        createdAt: c.createdAt,
        likeCount: 0,
        likedByMe: false,
      }));

    // 2) inscrieri concurs (poza + text) -> astea sunt "comment-uri cu poza"
    const entries = await ContestEntry.find({ contest: postId })
      .populate("user", "username img displayName")
      .sort({ createdAt: -1 })
      .lean();

    const contestComments = entries
      .filter((e) => e.user)
      .map((e) => {
        const raw = e.image || "";
        const fullImg = raw.startsWith("http") ? raw : raw ? `${baseUrl}${raw}` : null;

        const likesArr = e.likes || [];
        const likeCount = likesArr.length;
        const likedByMe = me ? likesArr.some((u) => u.toString() === me) : false;

        return {
          _id: e._id,
          type: "contestEntry", // ✅ ASTA iti lipsea pentru butonul de like
          description: e.comment || "",
          img: fullImg,
          user: e.user,
          createdAt: e.createdAt,
          likeCount,
          likedByMe,
        };
      });

    // 3) combinam + sortam desc dupa data
    const all = [...textComments, ...contestComments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return res.status(200).json(all);
  } catch (err) {
    console.error("getPostComments error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// addComment ramane DOAR text
export const addComment = async (req, res) => {
  try {
    const { description, pin } = req.body;
    const userId = req.userId;

    if (!description || !pin) {
      return res.status(400).json({ message: "Lipsesc descrierea sau pin-ul." });
    }

    const comment = await Comment.create({ description, pin, user: userId });

    const pinData = await Pin.findById(pin);
    if (pinData && pinData.user.toString() !== userId) {
      await Notification.create({
        recipient: pinData.user,
        sender: userId,
        type: "comment",
        pin,
      });
    }

    checkBadges(userId, "comment");

    return res.status(201).json(comment);
  } catch (err) {
    console.error("addComment error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};