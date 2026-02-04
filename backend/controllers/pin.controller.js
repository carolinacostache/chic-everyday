import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import Comment from "../models/comment.model.js";
import Tag from "../models/tag.model.js";
import Notification from "../models/notification.model.js";
import ContestEntry from "../models/contestEntry.model.js";

import Imagekit from "imagekit";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { checkBadges } from "../utils/gamification.js";

/* ====================== GET PINS ====================== */
export const getPins = async (req, res) => {
  try {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const tag = req.query.tag;
    const type = req.query.type;

    const loggedInUser = req.userId;

    const LIMIT = 18;
    const skip = pageNumber * LIMIT;
    const visibilityFilter = { visibility: { $nin: ["banned", "hidden"] } };


    if (search || userId || boardId || tag || type) {
      let query = {};
      let pins;
      let totalPinsInQuery;

      if (boardId) {
        const createdPinsQuery = Pin.find({ board: boardId }).select("_id");
        const savedPinsQuery = Save.find({ board: boardId }).select("pin");

        const [createdPins, savedPins] = await Promise.all([
          createdPinsQuery,
          savedPinsQuery,
        ]);

        const allPinIds = [
          ...new Set([
            ...createdPins.map((p) => p._id.toString()),
            ...savedPins.map((s) => s.pin.toString()),
          ]),
        ];

        totalPinsInQuery = allPinIds.length;
        const paginatedPinIds = allPinIds.slice(skip, skip + LIMIT);

        pins = await Pin.find({ _id: { $in: paginatedPinIds }, ...visibilityFilter }).populate(
          "user",
          "username img displayName"
        );
      } else if (type === "recommended" && loggedInUser) {
        const currentUser = await User.findById(loggedInUser);
        const followingIds = currentUser.following || [];

        const userLikes = await Like.find({ user: loggedInUser }).populate("pin");
        const likedPinIds = userLikes.map((like) => like.pin?._id);

        const tagsList = userLikes
          .map((like) => like.pin)
          .filter((pin) => pin != null)
          .flatMap((pin) => pin.tags);

        const uniqueTags = [...new Set(tagsList)];

        let recommendedQuery = {
            $and: [
                {
                    $or: [
                        { tags: { $in: uniqueTags } },        // Criteriul 1: Are tag-uri care îmi plac
                        { user: { $in: followingIds } }       // Criteriul 2: Este postat de un prieten
                    ]
                },
                { _id: { $nin: likedPinIds } }, // Excludem ce am văzut deja (like)
                { type: { $ne: 'contest' } },
                visibilityFilter    // Excludem concursurile (opțional)
            ]
        };

        pins = await Pin.find(recommendedQuery)
          .populate("user", "username img displayName")
          .sort({ views: -1, createdAt: -1 })
          .limit(LIMIT)
          .skip(skip);

        if (pins.length < 5) {
          const excludedIds = [...likedPinIds, ...pins.map((p) => p._id)];

          const fillerPins = await Pin.find({
            _id: { $nin: excludedIds },
            type: { $ne: "contest" },
          })
            .populate("user", "username img displayName")
            .sort({ views: -1, createdAt: -1 })
            .limit(LIMIT - pins.length);

          pins = [...pins, ...fillerPins];
        }

        totalPinsInQuery = pins.length + pageNumber * LIMIT + 1;
      } else if (type === "following" && loggedInUser) {
        const currentUser = await User.findById(loggedInUser);
        if (!currentUser.following || currentUser.following.length === 0) {
          pins = [];
          totalPinsInQuery = 0;
        } else {
            const followingQuery = {
                user: { $in: currentUser.following },
                type: { $ne: 'contest' },
                ...visibilityFilter
            };

          const count = await Pin.countDocuments(followingQuery);
          totalPinsInQuery = count;

          pins = await Pin.find(followingQuery)
            .populate("user", "username img displayName")
            .sort({ createdAt: -1 })
            .limit(LIMIT)
            .skip(skip);
        }
      } else if (type === "weather") {
        const rawTag = req.query.tag;

        if (!rawTag) {
          return res.status(400).json({ message: "Weather tag missing" });
        }

        let weatherQuery = {
            tags: { $regex: rawTag, $options: "i" }, 
            type: { $ne: 'contest' },
            ...visibilityFilter
        };

        pins = await Pin.find(weatherQuery)
          .populate("user", "username img displayName")
          .limit(LIMIT)
          .skip(skip);

        if (loggedInUser) {
          const userLikes = await Like.find({ user: loggedInUser }).populate("pin");

          const styleTags = userLikes
            .map((like) => like.pin)
            .filter((pin) => pin != null)
            .flatMap((pin) => pin.tags)
            .filter(
              (t) =>
                ![
                  "rainy",
                  "sunny",
                  "winter",
                  "summer",
                  "cloudy",
                  "snow",
                  "foggy",
                  "mist",
                ].includes(t)
            );

          const uniqueStyleTags = [...new Set(styleTags)];

          if (uniqueStyleTags.length > 0) {
            pins.sort((a, b) => {
              const aMatches = a.tags.filter((t) => uniqueStyleTags.includes(t)).length;
              const bMatches = b.tags.filter((t) => uniqueStyleTags.includes(t)).length;
              return bMatches - aMatches;
            });
          }
        }
        totalPinsInQuery = pins.length;
      } else {
        if (type && type !== "recommended") {
          query.type = type;
        }

        if (tag) {
          query.tags = { $in: [tag] };
        } else if (search) {
          const matchingUsers = await User.find({
            $or: [
              { displayName: { $regex: search, $options: "i" } },
              { username: { $regex: search, $options: "i" } },
            ],
          }).select("_id");
          const userIds = matchingUsers.map((u) => u._id);

          const matchingBoards = await Board.find({
            title: { $regex: search, $options: "i" },
          }).select("_id");
          const boardIds = matchingBoards.map((b) => b._id);

          query.$or = [ visibilityFilter,
            { title: { $regex: search, $options: "i" } },
            { tags: { $in: [search] } },
            { user: { $in: userIds } },
            { board: { $in: boardIds } },
          ];
        } else if (userId) {
          query.user = userId;

          if (type) {
            query.type = type;
          }
        }

        totalPinsInQuery = await Pin.countDocuments(query);
        pins = await Pin.find(query)
          .populate("user", "username img displayName")
          .sort({ createdAt: -1 })
          .limit(LIMIT)
          .skip(skip);
      }

      const hasNextPage = skip + pins.length < totalPinsInQuery;
      return res
        .status(200)
        .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
    } else {
      const standardQuery = { type: { $ne: "contest" } };

      const standardPins = await Pin.find(standardQuery)
        .populate("user", "username img displayName")
        .sort({ views: -1, createdAt: -1 })
        .limit(LIMIT)
        .skip(skip);

      const contestPins = await Pin.aggregate([
        { $match: { type: "contest", visibility: { $nin: ["banned", "hidden"] } } },
        { $sample: { size: 3 } },
      ]);

      await User.populate(contestPins, {
        path: "user",
        select: "username img displayName",
      });

      let finalFeed = [];
      let contestIndex = 0;

      standardPins.forEach((pin, index) => {
        finalFeed.push(pin);

        if ((index + 1) % 6 === 0 && contestIndex < contestPins.length) {
          finalFeed.push(contestPins[contestIndex]);
          contestIndex++;
        }
      });

      const totalStandardPins = await Pin.countDocuments(standardQuery);
      const hasNextPage = skip + LIMIT < totalStandardPins;

      return res.status(200).json({
        pins: finalFeed,
        nextCursor: hasNextPage ? pageNumber + 1 : null,
      });
    }
  } catch (error) {
    console.error("EROARE în getPins:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ====================== GET PIN ====================== */
export const getPin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await Pin.findById(id).populate("user", "username img displayName").populate("winner", "username img displayName");
    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }
    return res.status(200).json(pin);
  } catch (error) {
    console.error("EROARE în getPin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ====================== CREATE PIN ====================== */
export const createPin = async (req, res) => {
  try {
    const {
      title,
      description,
      link,
      board,
      tags,
      newBoard,
      width,
      height,
      textOptions,
      canvasOptions,
      isContest,
      prize,
      deadline,
    } = req.body;

    const media = req.files.media;

    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    if (!title || !description || !media || !width || !height) {
      return res.status(400).json({ message: "Lipsesc câmpuri obligatorii." });
    }

    const weatherTagsDocs = await Tag.find({ type: "weather" });
    const validWeatherTags = weatherTagsDocs.map((t) => t.name);
    const hasWeatherTag = tagsArray.some((tag) => validWeatherTags.includes(tag));
    if (!hasWeatherTag) {
      return res
        .status(400)
        .json({ message: "Vă rugăm selectați cel puțin un tag de vreme." });
    }

    let pinType = "standard";
    if (isContest === "true") {
      const user = await User.findById(req.userId);
      if (user.role !== "SHOP" && !user.isAdmin) {
        return res.status(403).json({ message: "Doar magazinele pot crea concursuri." });
      }
      pinType = "contest";

      if (!prize || !deadline) {
        return res.status(400).json({
          message: "Concursurile necesită un Premiu și o Dată Limită.",
        });
      }
    }

    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    let transformationString = "";

    if (textOptions) {
      const parsedText = JSON.parse(textOptions);

      if (parsedText.text && parsedText.text.trim() !== "") {
        const originalWidth = Number(width);
        const scaleFactor = originalWidth / 375;

        const textLeft = Math.round(parsedText.left * scaleFactor);
        const textTop = Math.round(parsedText.top * scaleFactor);
        const fontSize = Math.round(parsedText.fontSize * scaleFactor);

        const color = parsedText.color.replace("#", "");
        let safeText = encodeURIComponent(parsedText.text);
        safeText = safeText.replace(/'/g, "%27");

        transformationString = `l-text,i-${safeText},fs-${fontSize},lx-${textLeft},ly-${textTop},co-${color},l-end`;
      }
    }

    const response = await imagekit.upload({
      file: media.data,
      fileName: media.name,
      folder: "test",
      ...(transformationString && {
        transformation: {
          pre: transformationString,
        },
      }),
    });

    let boardIdToSave = board || null;
    if (newBoard) {
      if (board) return res.status(400).json({ message: "Conflict board." });
      const createdBoard = await Board.create({
        title: newBoard,
        user: req.userId,
      });
      boardIdToSave = createdBoard._id;
    }

    const newPin = await Pin.create({
      user: req.userId,
      title,
      description,
      link: link || null,
      board: boardIdToSave,
      tags: tagsArray,
      media: response.url,
      width: width,
      height: height,
      type: pinType,
      prize: pinType === "contest" ? prize : null,
      deadline: pinType === "contest" ? deadline : null,
    });

    checkBadges(req.userId, "post");

    if (boardIdToSave) {
      await Save.create({
        pin: newPin._id,
        user: req.userId,
        board: boardIdToSave,
      });
    }

    return res.status(201).json(newPin);
  } catch (err) {
    console.log("EROARE în createPin:", err);
    return res.status(500).json(err);
  }
};

/* ====================== INTERACTION CHECK ====================== */
export const interactionCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;
    const likeCount = await Like.countDocuments({ pin: id });

    if (!token) {
      return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
    }
    const userId = payload.userId;
    const isLiked = await Like.findOne({ user: userId, pin: id });
    const isSaved = await Save.exists({ user: userId, pin: id });
    return res.status(200).json({
      likeCount,
      isLiked: !!isLiked,
      isSaved: !!isSaved,
    });
  } catch (err) {
    console.error("EROARE în interactionCheck:", err.message);
    const likeCount = await Like.countDocuments({ pin: req.params.id }).catch(() => 0);
    return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
  }
};

/* ====================== INTERACT (LIKE/SAVE PIN) ====================== */
export const interact = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, boardId } = req.body;
    const userId = req.userId;

    if (type === "like") {
      const isLiked = await Like.findOne({ pin: id, user: userId });
      if (isLiked) {
        await Like.deleteOne({ pin: id, user: userId });
      } else {
        await Like.create({ pin: id, user: userId });
        const pinData = await Pin.findById(id);
        if (pinData.user.toString() !== userId) {
          await Notification.create({
            recipient: pinData.user,
            sender: userId,
            type: "like",
            pin: id,
          });
        }
      }
    } else if (type === "save") {
      if (!boardId) {
        return res.status(400).json({ message: "Board ID este necesar." });
      }
      const isSaved = await Save.findOne({
        pin: id,
        user: userId,
        board: boardId,
      });
      if (isSaved) {
        await Save.deleteOne({ _id: isSaved._id });
        return res.status(200).json({ message: "Unsaved" });
      } else {
        await Save.create({ pin: id, user: userId, board: boardId });
      }
    }
    return res.status(200).json({ message: "Successful" });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Pin-ul este deja salvat." });
    }
    console.error("EROARE în interact:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ====================== UPDATE PIN ====================== */
export const updatePin = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, tags } = req.body;
    const userId = req.userId;

    const pin = await Pin.findById(id);

    if (!pin) {
      return res.status(404).json({ message: "Pin-ul nu a fost găsit." });
    }

    if (pin.user.toString() !== userId) {
      return res.status(403).json({ message: "Nu ești autorizat să editezi." });
    }

    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    const mandatoryWeatherTags = ["rainy", "sunny", "winter", "summer", "cloudy", "foggy"];
    const hasWeatherTag = tagsArray.some((tag) => mandatoryWeatherTags.includes(tag));

    if (!title || !description) {
      return res.status(400).json({ message: "Titlul și descrierea sunt obligatorii." });
    }
    if (!hasWeatherTag) {
      return res.status(400).json({ message: "Selectați cel puțin un tag de vreme." });
    }

    pin.title = title;
    pin.description = description;
    pin.tags = tagsArray;

    const updatedPin = await pin.save();
    return res.status(200).json(updatedPin);
  } catch (error) {
    console.error("EROARE în updatePin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ====================== DELETE PIN ====================== */
export const deletePin = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const pin = await Pin.findById(id);

    if (!pin) {
      return res.status(404).json({ message: "Pin-ul nu a fost găsit." });
    }

    const currentUser = await User.findById(userId);
    const isAdmin = currentUser?.isAdmin;

    if (pin.user.toString() !== userId && !isAdmin) {
      return res.status(403).json({ message: "Nu ești autorizat să ștergi." });
    }

    await Pin.deleteOne({ _id: id });
    await Like.deleteMany({ pin: id });
    await Save.deleteMany({ pin: id });
    await Comment.deleteMany({ pin: id });

    // optional: sterge si participari la concurs
    await ContestEntry.deleteMany({ contest: id });

    return res.status(200).json({ message: "Pin-ul a fost șters cu succes." });
  } catch (error) {
    console.error("EROARE în deletePin:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

/* ====================== VIEW / CLICK ====================== */
export const viewPin = async (req, res) => {
  try {
    const { id } = req.params;
    await Pin.findByIdAndUpdate(id, { $inc: { views: 1 } });
    return res.status(200).json({ message: "View counted" });
  } catch (err) {
    return res.status(500).json({ message: "Error counting view" });
  }
};

export const clickPinLink = async (req, res) => {
  try {
    const { id } = req.params;
    await Pin.findByIdAndUpdate(id, { $inc: { linkClicks: 1 } });
    return res.status(200).json({ message: "Click counted" });
  } catch (err) {
    return res.status(500).json({ message: "Error counting click" });
  }
};

/* ====================== SHOP STATS ====================== */
/* ====================== SHOP STATS ====================== */
export const getShopStats = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Luăm pin-urile
    const pins = await Pin.find({ user: userId }).sort({ createdAt: -1 });

    // 2. Calculăm comentariile pentru fiecare pin și transformăm în obiect simplu
    const pinsWithStats = await Promise.all(
      pins.map(async (pin) => {
        const commentCount = await Comment.countDocuments({ pin: pin._id });
        return {
          ...pin.toObject(), // <--- IMPORTANT: Transformăm în obiect JS curat
          commentCount: commentCount || 0,
        };
      })
    );

    // 3. Calculăm totalurile folosind 'pinsWithStats' (care are datele corecte)
    let totalViews = 0;
    let totalClicks = 0;
    let totalLikes = 0;
    let totalComments = 0;

    pinsWithStats.forEach((pin) => {
      totalViews += pin.views || 0;
      totalClicks += pin.linkClicks || pin.clicks || 0; // Fallback pentru clicks
      totalLikes += pin.likes ? pin.likes.length : 0;
      totalComments += pin.commentCount || 0; // <--- Acum avem commentCount corect
    });

    // 4. Monetizare
    const costPerView = 0.01;
    const costPerClick = 0.5;
    const totalCost = totalViews * costPerView + totalClicks * costPerClick;

    // 5. Trimitem răspunsul
    res.status(200).json({
      totalPins: pins.length,
      totalViews,
      totalClicks,
      totalLikes,
      totalComments,
      monetization: {
        costPerView,
        costPerClick,
        totalCost: totalCost.toFixed(2),
      },
      pins: pinsWithStats, // Trimitem lista care conține și commentCount
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching stats" });
  }
};
/* ====================== participateContest (upload) - ImageKit ====================== */
export const participateContest = async (req, res) => {
  try {
    const pinId = req.params.id;

    const pin = await Pin.findById(pinId);
    if (!pin) return res.status(404).json({ message: "Pin not found" });
    if (pin.type !== "contest") {
      return res.status(400).json({ message: "Pin is not a contest" });
    }
    if (pin.winner) {
      return res.status(400).json({ message: "Acest concurs s-a încheiat!" });
    }

    if (pin.deadline && new Date(pin.deadline) < new Date()) {
      return res.status(400).json({ message: "Contest ended" });
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ message: "Image is required" });
    }

    const already = await ContestEntry.findOne({
      contest: pinId,
      user: req.userId,
    });
    if (already) {
      return res.status(400).json({ message: "Already participated" });
    }

    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    const imageFile = req.files.image;

    const uploadResult = await imagekit.upload({
      file: imageFile.data.toString("base64"),
      fileName: `contest-${pinId}-${req.userId}-${Date.now()}.jpg`,
      folder: "/contest-entries",
    });

    const entry = await ContestEntry.create({
      contest: pinId,
      user: req.userId,
      image: uploadResult.url, // ✅ https://...
      comment: req.body.comment || "",
      likes: [], // ✅ important pt concurs
    });

    return res.status(201).json(entry);
  } catch (err) {
    console.error("EROARE în participateContest:", err);
    return res.status(500).json({ message: "Server error" });
  }
};


/* ====================== LIKE / UNLIKE pe CONTEST ENTRY ====================== */
export const toggleContestEntryLike = async (req, res) => {
  try {
    const pinId = req.params.id;
    const entryId = req.params.entryId;
    const userId = req.userId;

    const pin = await Pin.findById(pinId);
    if (!pin) return res.status(404).json({ message: "Pin not found" });
    if (pin.type !== "contest") {
      return res.status(400).json({ message: "Pin is not a contest" });
    }
    if (pin.winner) {
      return res.status(400).json({ message: "Acest concurs s-a încheiat!" });
    }

    const entry = await ContestEntry.findOne({ _id: entryId, contest: pinId });
    if (!entry) return res.status(404).json({ message: "Entry not found" });

    const alreadyLiked = (entry.likes || []).some((u) => u.toString() === userId);

    if (alreadyLiked) {
      await ContestEntry.updateOne({ _id: entryId }, { $pull: { likes: userId } });
    } else {
      await ContestEntry.updateOne({ _id: entryId }, { $addToSet: { likes: userId } });
    }

    const updated = await ContestEntry.findById(entryId).select("likes");
    return res.status(200).json({
      liked: !alreadyLiked,
      likeCount: updated.likes.length,
    });
  } catch (err) {
    console.error("toggleContestEntryLike error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const finalizeContestWinner = async (req, res) => {
  try {
    const { id } = req.params; // ID-ul concursului
    const userId = req.userId; // ID-ul tău

    const pin = await Pin.findById(id);
    if (!pin) return res.status(404).json({ message: "Concursul nu a fost găsit!" });

    // Validare: Doar proprietarul alege câștigătorul
    if (pin.user.toString() !== userId) {
      return res.status(403).json({ message: "Nu ai permisiunea de a alege câștigătorul!" });
    }

    // AGREGARE: Găsim câștigătorul
    const winningEntries = await ContestEntry.aggregate([
      { 
        $match: { 
          contest: new mongoose.Types.ObjectId(id) // Doar intrările acestui concurs
        } 
      },
      { 
        $addFields: { 
          likeCount: { $size: { $ifNull: ["$likes", []] } } // Calculăm nr. like-uri
        } 
      },
      { 
        $sort: { 
          likeCount: -1,   // PRIMUL CRITERIU: Cele mai multe like-uri
          createdAt: -1    // AL DOILEA CRITERIU: Cel mai recent (data cea mai mare)
        } 
      },
      { $limit: 1 } // Îl luăm pe primul din listă
    ]);

    if (winningEntries.length === 0) {
      return res.status(400).json({ message: "Nu există înscrieri în acest concurs." });
    }

    const winnerEntry = winningEntries[0];
    const winnerUser = await User.findById(winnerEntry.user);

    // 1. Salvăm câștigătorul în Pin
    pin.winner = winnerUser._id;
    await pin.save();

    // 2. Acordăm puncte de gamification (ex: 200 puncte)
    await User.findByIdAndUpdate(winnerUser._id, {
      $inc: { "gamification.points": 200 }
    });
    
    // Verificăm dacă a câștigat vreo insignă nouă
    checkBadges(winnerUser._id, "contest_win");

    // 3. Trimitem notificare câștigătorului
    await Notification.create({
      recipient: winnerUser._id,
      sender: userId,
      type: "contest_win", // Asigură-te că frontend-ul știe să afișeze acest tip
      text: `Felicitări! Ai câștigat concursul "${pin.title}"! 🏆`,
      pin: pin._id,
      isRead: false
    });

    res.status(200).json({ 
      message: `Câștigător: ${winnerUser.displayName || winnerUser.username} (${winnerEntry.likeCount} voturi).`, 
      winner: winnerUser 
    });

  } catch (err) {
    console.error("Eroare la finalizare concurs:", err);
    res.status(500).json({ message: "Eroare server." });
  }
};

/* ====================== GET CONTEST ENTRIES ====================== */
// (Rămâne neschimbată, doar pentru afișarea listei)
export const getContestEntries = async (req, res) => {
    // ... codul tău existent
    try {
        const pinId = req.params.id;
        const entries = await ContestEntry.find({ contest: pinId })
          .populate("user", "username img displayName")
          .sort({ createdAt: -1 });
    
        return res.status(200).json(entries);
      } catch (err) {
        console.error("EROARE in getContestEntries:", err);
        return res.status(500).json({ message: "Server error" });
      }
};

/* ====================== GET CONTEST WINNER (Read-Only) ====================== */
// Aceasta funcție doar returnează cine conduce momentan, fără să închidă concursul
export const getContestWinner = async (req, res) => {
  try {
    const pinId = req.params.id;

    const pin = await Pin.findById(pinId);
    if (!pin) return res.status(404).json({ message: "Pin not found" });
    if (pin.type !== "contest") {
      return res.status(400).json({ message: "Pin is not a contest" });
    }

    // Aceeași logică de sortare ca la finalizare, pentru consistență
    const entries = await ContestEntry.find({ contest: pinId })
      .populate("user", "username img displayName")
      .sort({ createdAt: -1 }) // Sortăm după dată (desc) pentru a aplica logica în JS
      .lean();

    if (!entries.length) {
      return res.status(200).json({ winner: null, message: "No entries yet" });
    }

    // Sortare manuală în JS pentru a respecta regula: Max Like-uri, apoi Cel Mai Recent
    entries.sort((a, b) => {
        const likesA = a.likes?.length || 0;
        const likesB = b.likes?.length || 0;
        if (likesB !== likesA) {
            return likesB - likesA; // Descrescător după like-uri
        }
        return new Date(b.createdAt) - new Date(a.createdAt); // Descrescător după dată (cel mai recent primul)
    });

    const winner = entries[0];
    const bestLikes = winner.likes?.length || 0;

    return res.status(200).json({
      winner,
      likeCount: bestLikes,
    });
  } catch (err) {
    console.error("getContestWinner error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};