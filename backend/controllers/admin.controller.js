import mongoose from "mongoose";
import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Comment from "../models/comment.model.js";
import Tag from "../models/tag.model.js";
import Board from "../models/board.model.js";
import Save from "../models/save.model.js";
import Report from "../models/report.model.js";

const logAudit = (actionType, adminId, targetId, details) => {
  const logEntry = {
    type: actionType,
    adminId: adminId,
    targetId: targetId,
    details: details,
    timestamp: new Date()
  };
  console.log("[AUDIT ACTION]", JSON.stringify(logEntry));
};

export const getAllUsers = async (req, res) => {
  try {
    const { search } = req.query;
    let query = {role: { $ne: "BANNED" }};

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
    const { role, reason } = req.body;
    const adminId = req.userId;

    if (id === adminId) {
      return res.status(403).json({ message: "Nu îți poți modifica propriul rol." });
    }

    const previousUser = await User.findById(id);
    if (!previousUser) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit." });
    }

    const validRoles = ["USER", "ADMIN", "SHOP", "BANNED"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Rol invalid." });
    }

    if (previousUser.role === role) {
      return res.status(400).json({ message: "Utilizatorul are deja acest rol." });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { role: role },
      { new: true }
    ).select("-hashedPassword");

    // AUDIT RIGUROS
    logAudit("ROLE_CHANGE", adminId, id, {
      oldRole: previousUser.role,
      newRole: role,
      reason: reason || "Nespecificat"
    });

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("EROARE în adminUpdateUserRole:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason, banDuration } = req.body;
    const adminId = req.userId;

    if (id === adminId) {
      return res.status(403).json({ message: "Nu te poți bana singur." });
    }

    const bannedUser = await User.findByIdAndUpdate(id, {
      role: "BANNED",
      bannedAt: new Date(),
      banReason: reason || "Încălcarea termenilor",
    }, { new: true });

    if (!bannedUser) return res.status(404).json({ message: "User not found" });

    await Pin.updateMany({ user: id }, { visibility: "hidden" });
    await Comment.updateMany({ user: id }, { isVisible: false });

    logAudit("USER_BAN", adminId, id, {
      reason: reason,
      action: "Role changed to BANNED & content hidden"
    });

    res.status(200).json({ message: `Utilizator banat. Motiv: ${reason}` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getContentForModeration = async (req, res) => {
  try {
    // Luăm ultimele 20 de pin-uri care NU sunt deja banate/șterse
    const pins = await Pin.find({ visibility: { $ne: "banned" } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "username img");
    
    // Luăm ultimele 20 de comentarii vizibile
    const comments = await Comment.find({ isVisible: { $ne: false } })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("user", "username img")
      .populate("pin", "title");

    res.status(200).json({ pins, comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Eroare la preluarea conținutului" });
  }
};

export const adminDeletePin = async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedPin = await Pin.findByIdAndUpdate(id, {
      $set: { 
        visibility: "banned",
        deletedAt: new Date(),
        deletedBy: req.userId
      }
    }, { new: true });

    await Comment.updateMany({ pin: id }, { $set: { isVisible: false } });
    
    logAudit("PIN_HIDE", req.userId, id, { action: "Visibility set to banned" });

    res.status(200).json({ message: "Pin ascuns (banat) de admin." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    
    await Comment.findByIdAndUpdate(id, { isVisible: false });
    
    logAudit("COMMENT_HIDE", req.userId, id, { action: "isVisible set to false" });

    res.status(200).json({ message: "Comentariu ascuns de admin." });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const adminDeleteBoard = async (req, res) => {
  try {
    const { id } = req.params;

    // Board-urile se pot șterge fizic, dar păstrăm auditul
    const board = await Board.findByIdAndDelete(id);
    
    if(board) {
        await Save.deleteMany({ board: id });
        await Pin.updateMany({ board: id }, { $unset: { board: "" } });
        
        // AUDIT RIGUROS
        logAudit("BOARD_DELETE", req.userId, id, { 
            boardName: board.title,
            owner: board.user 
        });
    }

    res.status(200).json({ message: "Board șters de admin." });
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
    
    logAudit("TAG_ADD", req.userId, newTag._id, { tagName: name });

    res.status(201).json(newTag);
  } catch (err) {
    res.status(500).json({ message: "Eroare la adăugare (poate există deja?)" });
  }
};

export const deleteWeatherTag = async (req, res) => {
  try {
    const { id } = req.params;
    await Tag.findByIdAndDelete(id);
    
    logAudit("TAG_DELETE", req.userId, id, { type: "weather" });

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

    logAudit("TAG_WIPE", req.userId, null, { 
        tagName: tagName, 
        action: "Removed from all posts" 
    });

    res.status(200).json({ message: `Tag-ul "${tagName}" a fost șters din toate postările.` });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};


export const approveShop = async (req, res) => {
  try {
    const { id } = req.params;
    
    await User.findByIdAndUpdate(id, {
      role: "SHOP",
      "shopDetails.status": "VERIFIED",
      "shopDetails.approvedAt": new Date()
    });

    logAudit("SHOP_APPROVE", req.userId, id, {});

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

    logAudit("SHOP_REJECT", req.userId, id, {});

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

    const pendingReportsCount = await Report.countDocuments({ status: "pending" });

    const shopPerformance = await User.aggregate([
      { $match: { role: "SHOP" } }, 
      {
        $lookup: {
          from: "pins", 
          localField: "_id",
          foreignField: "user",
          as: "shopPosts"
        }
      },
      {
        $project: {
          username: 1,
          shopName: "$shopDetails.shopName",
          logo: "$img",
          status: "$shopDetails.status",
          totalViews: { $sum: "$shopPosts.views" },
          totalClicks: { $sum: "$shopPosts.linkClicks" }, 
          postCount: { $size: "$shopPosts" }
        }
      },
      { $sort: { totalViews: -1 } } 
    ]);

    const COST_PER_VIEW = 0.01;
    const COST_PER_CLICK = 0.5;

    const shopsWithBilling = shopPerformance.map(shop => {
      const estimatedBill = (shop.totalViews * COST_PER_VIEW) + (shop.totalClicks * COST_PER_CLICK);
      
      let tier = "Bronze 🥉";
      if (estimatedBill > 500) tier = "Diamond 💎";
      else if (estimatedBill > 100) tier = "Gold 🥇";
      else if (estimatedBill > 50) tier = "Silver 🥈";

      return {
        ...shop,
        estimatedBill: estimatedBill.toFixed(2),
        tier
      };
    });

    const totalRevenue = shopsWithBilling.reduce((acc, curr) => acc + parseFloat(curr.estimatedBill), 0);

    res.status(200).json({
      counts: {
        users: totalUsers,
        pins: totalPins,
        boards: totalBoards,
        comments: totalComments,
        pendingShops: pendingShops,
        pendingReports: pendingReportsCount
      },
      latestUsers: latestUsers,
      revenue: totalRevenue.toFixed(2),
      shopsLeaderboard: shopsWithBilling
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error stats" });
  }
};

export const createReport = async (req, res) => {
  try {
    const { targetId, targetType, reason } = req.body;
    const newReport = await Report.create({
      reporter: req.userId,
      targetId,
      targetType,
      reason
    });
    res.status(201).json({ message: "Raport trimis cu succes." });
  } catch (err) {
    res.status(500).json({ message: "Eroare la trimiterea raportului." });
  }
};

export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: "pending" })
      .populate("reporter", "username")
      .sort({ createdAt: -1 });

    // Pentru a vedea detaliile Pin-ului raportat, facem un populate manual
    const populatedReports = await Promise.all(
      reports.map(async (report) => {
        const targetData = await Pin.findById(report.targetId).select("title media");
        return { ...report._doc, targetData };
      })
    );

    res.status(200).json(populatedReports);
  } catch (err) {
    res.status(500).json({ message: "Eroare la preluarea rapoartelor." });
  }
};

export const resolveReport = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Actualizăm statusul raportului
    const updatedReport = await Report.findByIdAndUpdate(
      id, 
      { status: "resolved" }, 
      { new: true }
    );

    if (!updatedReport) return res.status(404).json({ message: "Raportul nu a fost găsit." });

    logAudit("REPORT_RESOLVE", req.userId, id, { action: "Marked as resolved" });

    res.status(200).json({ message: "Raportul a fost marcat ca rezolvat." });
  } catch (err) {
    res.status(500).json({ message: "Eroare la procesarea raportului." });
  }
};