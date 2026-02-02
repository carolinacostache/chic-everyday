import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import Comment from "../models/comment.model.js";
import Tag from "../models/tag.model.js";
import Notification from "../models/notification.model.js";
import Imagekit from "imagekit";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { checkBadges } from "../utils/gamification.js";


export const getPins = async (req, res) => {
  try {
    const pageNumber = Number(req.query.cursor) || 0;
    const search = req.query.search;
    const userId = req.query.userId;
    const boardId = req.query.boardId;
    const tag = req.query.tag;
    const type = req.query.type;

    const LIMIT = 18;
    const skip = pageNumber * LIMIT;

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

        const allPinIds = [...new Set([
                ...createdPins.map((p) => p._id.toString()), 
                ...savedPins.map((s) => s.pin.toString())
            ])];

        totalPinsInQuery = allPinIds.length;
        const paginatedPinIds = allPinIds.slice(skip, skip + LIMIT);

        pins = await Pin.find({ _id: { $in: paginatedPinIds } }).populate(
          "user",
          "username img displayName"
        );
      } else {
        
        if (type) {
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
          const userIds = matchingUsers.map(u => u._id);

          const matchingBoards = await Board.find({
            title: { $regex: search, $options: "i" },
          }).select("_id");
          const boardIds = matchingBoards.map(b => b._id);

          query.$or = [
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
    res
      .status(200)
      .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
  }
  else {
        // 1. Luăm postările STANDARD (excludem concursurile din lista principală)
        const standardQuery = { type: { $ne: 'contest' } };
        
        // SORTARE DUPĂ INTERES: Cele mai vizualizate primele, apoi cele noi
        // Asta răspunde cerinței de "recomandări personalizate" [cite: 177]
        const standardPins = await Pin.find(standardQuery)
            .populate("user", "username img displayName")
            .sort({ views: -1, createdAt: -1 }) 
            .limit(LIMIT)
            .skip(skip);

        // 2. Luăm câteva CONCURSURI active (random)
        // Luăm 3 concursuri random pentru a le insera în pagină
        const contestPins = await Pin.aggregate([
            { $match: { type: 'contest' } }, // Doar concursuri
            { $sample: { size: 3 } } // 3 Aleatorii
        ]);
        
        // Trebuie să populăm userul și pentru concursurile luate prin aggregate
        await User.populate(contestPins, { path: "user", select: "username img displayName" });

        // 3. ALGORITM DE INJECȚIE (Pinterest Style)
        let finalFeed = [];
        let contestIndex = 0;

        // Introducem un concurs la fiecare 6 postări normale
        standardPins.forEach((pin, index) => {
            finalFeed.push(pin);

            // Dacă am pus 6 postări normale și mai avem concursuri disponibile
            if ((index + 1) % 6 === 0 && contestIndex < contestPins.length) {
                // Adăugăm concursul în feed
                finalFeed.push(contestPins[contestIndex]);
                contestIndex++;
            }
        });

        // Verificăm paginarea
        const totalStandardPins = await Pin.countDocuments(standardQuery);
        const hasNextPage = skip + LIMIT < totalStandardPins;

        return res.status(200).json({ 
            pins: finalFeed, 
            nextCursor: hasNextPage ? pageNumber + 1 : null 
        });
    }
 } catch (error) {
    console.error("EROARE în getPins:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPin = async (req, res) => {
  try {
    const { id } = req.params;
    const pin = await Pin.findById(id).populate(
      "user",
      "username img displayName"
    );
    if (!pin) {
      return res.status(404).json({ message: "Pin not found" });
    }
    res.status(200).json(pin);
  } catch (error) {
    console.error("EROARE în getPin:", error);
    res.status(500).json({ message: "Server error" });
  }
};


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
      deadline
    } = req.body;

    const media = req.files.media;

    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    if (!title || !description || !media || !width || !height) {
      return res.status(400).json({ message: "Lipsesc câmpuri obligatorii." });
    }
    
    const weatherTagsDocs = await Tag.find({ type: "weather" });
    const validWeatherTags = weatherTagsDocs.map(t => t.name);
    const hasWeatherTag = tagsArray.some((tag) => validWeatherTags.includes(tag));
    if (!hasWeatherTag) {
      return res.status(400).json({ message: "Vă rugăm selectați cel puțin un tag de vreme." });
    }

    let pinType = "standard";
    if (isContest === "true") {
      const user = await User.findById(req.userId);
      if (user.role !== "SHOP" && !user.isAdmin) {
        return res.status(403).json({ message: "Doar magazinele pot crea concursuri." });
      }
      pinType = "contest";
      
      if (!prize || !deadline) {
        return res.status(400).json({ message: "Concursurile necesită un Premiu și o Dată Limită." });
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

        transformationString = `l-text,i-${parsedText.text},fs-${fontSize},lx-${textLeft},ly-${textTop},co-${color},l-end`;
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
      const createdBoard = await Board.create({ title: newBoard, user: req.userId });
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
      await Save.create({ pin: newPin._id, user: req.userId, board: boardIdToSave });
    }

    return res.status(201).json(newPin);

  } catch (err) {
    console.log("EROARE în createPin:", err);
    return res.status(500).json(err);
  }
};

export const interactionCheck = async (req, res) => {
  try {
    const { id } = req.params;
    const token = req.cookies.token;
    const likeCount = await Like.countDocuments({ pin: id });

    if (!token) {
      return res
        .status(200)
        .json({ likeCount, isLiked: false, isSaved: false });
    }
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (!payload) {
      return res
        .status(200)
        .json({ likeCount, isLiked: false, isSaved: false });
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
    const likeCount = await Like.countDocuments({ pin: req.params.id }).catch(
      () => 0
    );
    return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
  }
};

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
            pin: id
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
    res.status(500).json({ message: "Server error" });
  }
};

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
      return res
        .status(403)
        .json({ message: "Nu ești autorizat să editezi." });
    }

    const tagsArray = tags ? tags.split(",").map((tag) => tag.trim()) : [];
    const mandatoryWeatherTags = [
      "rainy",
      "sunny",
      "winter",
      "summer",
      "cloudy",
      "foggy",
    ];
    const hasWeatherTag = tagsArray.some((tag) =>
      mandatoryWeatherTags.includes(tag)
    );

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Titlul și descrierea sunt obligatorii." });
    }
    if (!hasWeatherTag) {
      return res
        .status(400)
        .json({ message: "Selectați cel puțin un tag de vreme." });
    }

    pin.title = title;
    pin.description = description;
    pin.tags = tagsArray;

    const updatedPin = await pin.save();
    res.status(200).json(updatedPin);
  } catch (error) {
    console.error("EROARE în updatePin:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
      return res
        .status(403)
        .json({ message: "Nu ești autorizat să ștergi." });
    }

    await Pin.deleteOne({ _id: id });
    await Like.deleteMany({ pin: id });
    await Save.deleteMany({ pin:id });
    await Comment.deleteMany({ pin: id });

    res.status(200).json({ message: "Pin-ul a fost șters cu succes." });
  
  } catch (error) {
    console.error("EROARE în deletePin:", error);
    res.status(500).json({ message: "Server error" });
  
  }
};

export const viewPin = async (req, res) => {
  try {
    const { id } = req.params;
    await Pin.findByIdAndUpdate(id, { $inc: { views: 1 } });
    res.status(200).json({ message: "View counted" });
  } catch (err) {
    res.status(500).json({ message: "Error counting view" });
  }
};

export const clickPinLink = async (req, res) => {
  try {
    const { id } = req.params;
    await Pin.findByIdAndUpdate(id, { $inc: { linkClicks: 1 } });
    res.status(200).json({ message: "Click counted" });
  } catch (err) {
    res.status(500).json({ message: "Error counting click" });
  }
};

export const getShopStats = async (req, res) => {
  try {
    const userId = req.userId;

    // 1. Luăm TOATE postările magazinului (ca să le putem afișa în tabel)
    const pins = await Pin.find({ user: userId }).sort({ createdAt: -1 });

    // 2. Calculăm totalurile iterând prin array-ul de pin-uri
    let totalViews = 0;
    let totalClicks = 0;
    let totalLikes = 0;
    let totalComments = 0;

    pins.forEach((pin) => {
      totalViews += pin.views || 0;
      // Atenție: În codul tău anterior era 'linkClicks', asigură-te că așa se numește în model
      totalClicks += pin.linkClicks || 0; 
      totalLikes += pin.likes ? pin.likes.length : 0;
      totalComments += pin.commentCout || 0;
    });

    // 3. Setările de monetizare (folosind valorile tale: 0.01 și 0.5)
    const costPerView = 0.01;
    const costPerClick = 0.5;
    const totalCost = (totalViews * costPerView) + (totalClicks * costPerClick);

    res.status(200).json({
      totalPins: pins.length,
      totalViews,
      totalClicks,
      totalLikes,
      totalComments,
      monetization: {
        costPerView,
        costPerClick,
        totalCost: totalCost.toFixed(2)
      },
      pins: pins // <--- FOARTE IMPORTANT: Trimitem lista pentru a popula tabelul din frontend
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stats" });
  }
};