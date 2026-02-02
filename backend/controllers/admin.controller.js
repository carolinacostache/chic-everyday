import mongoose from "mongoose";
import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Comment from "../models/comment.model.js";
import Tag from "../models/tag.model.js";
import Board from "../models/board.model.js";
import Save from "../models/save.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};

    if (search) {
      const searchConditions = [
        { username: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { displayName: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } }
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }

      query = { $or: searchConditions };
    };

    const users = await User.find(query).select("-hashedPassword").sort({createdAt: -1});
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminUpdateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    // Validăm dacă rolul este unul permis
    const validRoles = ["USER", "ADMIN", "SHOP"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol invalid." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true } // Returnează userul actualizat
    ).select("-hashedPassword");

    if (!updatedUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("EROARE în adminUpdateUserRole:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "Utilizator șters." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeletePin = async (req, res) => {
  try {
    const { id } = req.params;
    await Pin.findByIdAndDelete(id);
    await Comment.deleteMany({ pin: id });
    res.status(200).json({ message: "Pin șters de admin." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    await Comment.findByIdAndDelete(id);
    res.status(200).json({ message: "Comentariu șters de admin." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getTagsData = async (req, res) => {
  try {
    const { search } = req.query;

    const weatherTagsDocs = await Tag.find({ type: "weather" });
    const weatherTags = weatherTagsDocs.map(t => t.name);

    const pipeline = [
      { $unwind: "$tags" },
      { $match: { tags: { $nin: weatherTags } } }
    ];

    if (search) {
      pipeline.push({
        $match: { tags: { $regex: search, $options: "i" } }
      });
    }

    pipeline.push(
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    );

    const userTagsAgg = await Pin.aggregate(pipeline);

    res.status(200).json({
      weatherTags: weatherTagsDocs,
      userTags: userTagsAgg
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error fetching tags" });
  }
};

export const addWeatherTag = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "Numele este obligatoriu" });

    const newTag = await Tag.create({ name: name.toLowerCase(), type: "weather" });
    res.status(201).json(newTag);
  } catch (err) {
    res.status(500).json({ message: "Eroare la adăugare (poate există deja?)" });
  }
};

export const deleteWeatherTag = async (req, res) => {
  try {
    const { id } = req.params;
    await Tag.findByIdAndDelete(id);
    res.status(200).json({ message: "Tag meteo șters." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteUserTag = async (req, res) => {
  try {
    const { tagName } = req.body;
    
    await Pin.updateMany(
      { tags: tagName },
      { $pull: { tags: tagName } }
    );

    res.status(200).json({ message: `Tag-ul "${tagName}" a fost șters din toate postările.` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAllBoards = async (req, res) => {
  try {
    const {search} = req.query;
    let query = {};

    if (search) {

      const matchingUsers = await User.find({
        $or: [
          { username: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { displayName: { $regex: search, $options: "i" } }
        ]
      }).select("_id");

      const userIds = matchingUsers.map(u => u._id);

      const searchConditions = [
        { title: { $regex: search, $options: "i"}},
        { user: { $in: userIds }}
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        searchConditions.push({ _id: search });
      }

      query = { $or: searchConditions };
    };

    const boards = await Board.find(query)
      .populate("user", "username img displayName")
      .sort({ createdAt: -1 });
    res.status(200).json(boards);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    await Board.findByIdAndDelete(id);
    await Save.deleteMany({ board: id });
    await Pin.updateMany({ board: id }, { $unset: { board: "" } });

    res.status(200).json({ message: "Board șters de admin." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    
    await User.findByIdAndUpdate(id, {
      role: "SHOP",
      "shopDetails.status": "VERIFIED"
    });

    res.status(200).json({ message: "Magazin aprobat cu succes!" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const rejectShop = async (req, res) => {
  try {
    const { id } = req.params;

    await User.findByIdAndUpdate(id, {
      "shopDetails.status": "REJECTED"
    });

    res.status(200).json({ message: "Cerere respinsă." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAdminStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalPins,
      totalBoards,
      totalComments,
      pendingShops,
      latestUsers
    ] = await Promise.all([
      User.countDocuments(),
      Pin.countDocuments(),
      Board.countDocuments(),
      Comment.countDocuments(),
      User.countDocuments({ "shopDetails.status": "PENDING" }),
      User.find().sort({ createdAt: -1 }).limit(5).select("username email img createdAt role")
    ]);

    res.status(200).json({
      counts: {
        users: totalUsers,
        pins: totalPins,
        boards: totalBoards,
        comments: totalComments,
        pendingShops: pendingShops
      },
      latestUsers: latestUsers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error stats" });
  }
};