import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "username img displayName")
      .populate("pin", "media")
      .sort({ createdAt: -1 });

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: "Marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    // Actualizăm TOATE notificările userului care sunt necitite
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { $set: { isRead: true } }
    );
    res.status(200).json({ message: "Toate notificările au fost marcate ca citite" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};