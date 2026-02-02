import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";
import Pin from "../models/pin.model.js"; 
import Notification from "../models/notification.model.js";
import { checkBadges } from "../utils/gamification.js";

export const getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ pin: postId })
      .populate({
        path: "user",
        select: "username img displayName",
      })
      .sort({ createdAt: -1 });

    const validComments = comments.filter((comment) => comment.user !== null);

    res.status(200).json(validComments);

  } catch (error) {
    console.error("!!! EROARE ÎN getPostComments:", error); 
    res.status(500).json({ message: "Server error" });
  }
};

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
        recipient: pinData.user, // Proprietarul primește notificarea
        sender: userId,          // Tu ai trimis-o
        type: "comment",
        pin: pin                 // Legătura către pin
      });
    }
    checkBadges(req.userId, "comment");
    res.status(201).json(comment);

  } catch (error) {
    console.error("!!! EROARE ÎN addComment:", error);
    res.status(500).json({ message: "Server error" });
  }
};