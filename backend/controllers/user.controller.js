import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Imagekit from "imagekit"; 

export const registerUser = async (req, res) => {
  try {
    const { username, displayName, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const newHashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      displayName,
      email,
      hashedPassword: newHashedPassword,
    });

    const token = jwt.sign(
      { 
        userId: user._id, 
        isAdmin: user.isAdmin
      }, 
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/"
    });
    const { hashedPassword, ...detailsWithoutPassword } = user.toObject();
    res.status(201).json(detailsWithoutPassword);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(409)
        .json({ message: "Username-ul sau email-ul există deja" });
    }
    console.error("EROARE în registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required!" });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.hashedPassword
    );
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { 
        userId: user._id,
        isAdmin: user.isAdmin
      }, 
      process.env.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 30 * 24 * 60 * 60 * 1000,
      path: "/"
    });
    const { hashedPassword, ...detailsWithoutPassword } = user.toObject();
    res.status(200).json(detailsWithoutPassword);
  } catch (error) {
    console.error("EROARE în loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const logoutUser = async (req, res) => {
  try {
    res.clearCookie("token" , {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    res.status(200).json({ message: "Logout successful" });
  } catch (error) {
    console.error("EROARE în logoutUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const getUser = async (req, res) => {
  try {
    const { username } = req.params;
    const token = req.cookies.token;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }

    const { hashedPassword, ...detailsWithoutPassword } = user.toObject();
    const followerCount = await Follow.countDocuments({ following: user._id });
    const followingCount = await Follow.countDocuments({ follower: user._id });

    let isFollowing = false;
    if (token) {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        if (payload) {
          const isExists = await Follow.exists({
            follower: payload.userId,
            following: user._id,
          });
          isFollowing = !!isExists;
        }
      } catch (err) {
        console.warn("Token invalid la getUser:", err.message);
      }
    }

    res.status(200).json({
      ...detailsWithoutPassword,
      followerCount,
      followingCount,
      isFollowing: isFollowing,
    });
    
  } catch (error) {
    console.error("EROARE în getUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};


export const followUser = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.userId;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Utilizatorul nu a fost găsit" });
    }
    if (user._id.toString() === currentUserId) {
      return res.status(400).json({ message: "Nu te poți urmări singur" });
    }

    const isFollowing = await Follow.exists({
      follower: currentUserId,
      following: user._id,
    });

    if (isFollowing) {
      await Follow.deleteOne({ follower: currentUserId, following: user._id });
      await User.findByIdAndUpdate(user._id, {
        $pull: { followers: currentUserId }
      });

      // 3. Scoatem ID-ul din array-ul 'following' al nostru (CRITIC PENTRU FEED)
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId }
      });
    } else {
      await Follow.create({ follower: currentUserId, following: user._id });
      await User.findByIdAndUpdate(user._id, {
        $push: { followers: currentUserId }
      });

      // 3. Adăugăm ID-ul în array-ul 'following' al nostru (CRITIC PENTRU FEED)
      await User.findByIdAndUpdate(currentUserId, {
        $push: { following: user._id }
      });
      await Notification.create({
      recipient: user._id,
      sender: currentUserId,
      type: "follow"
    });
    }
    res.status(200).json({ message: "Successful" });
  } catch (error) {
    console.error("EROARE în followUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ following: userId }).populate(
      "follower",
      "username displayName img"
    );
    res.status(200).json(follows);
  } catch (error) {
    console.error("EROARE în getUserFollowers:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const follows = await Follow.find({ follower: userId }).populate(
      "following",
      "username displayName img"
    );
    res.status(200).json(follows);
  } catch (error) {
    console.error("EROARE în getUserFollowing:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const submitShopApplication = async (req, res) => {
  try {
    const userId = req.userId; // Luat din token
    const { website } = req.body;

    // 1. Verificăm dacă a încărcat fișierul
    if (!req.files || !req.files.document) {
      return res.status(400).json({ message: "Documentul doveditor este obligatoriu!" });
    }

    const docFile = req.files.document;
    const fileData = docFile.tempFilePath || docFile.data; // Compatibil cu ambele setări din index.js

    // 2. Inițializăm ImageKit
    const imagekit = new Imagekit({
      publicKey: process.env.IK_PUBLIC_KEY,
      privateKey: process.env.IK_PRIVATE_KEY,
      urlEndpoint: process.env.IK_URL_ENDPOINT,
    });

    // 3. Încărcăm documentul (PDF sau Imagine)
    const uploadResponse = await imagekit.upload({
      file: fileData,
      fileName: `shop_doc_${userId}_${docFile.name}`,
      folder: "shop_applications",
    });

    // 4. Actualizăm utilizatorul
    // Nu schimbăm încă 'role' în 'SHOP'. Așteptăm aprobarea adminului.
    // Doar salvăm detaliile și setăm statusul 'PENDING'.
    const updatedUser = await User.findByIdAndUpdate(userId, {
      shopDetails: {
        verificationDocument: uploadResponse.url,
        website: website || "",
        status: "PENDING",
        level: "Bronze"
      }
    },
    { new: true });

    if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
    }

    const { hashedPassword, ...rest } = updatedUser._doc;

    res.status(200).json(rest);

  } catch (err) {
    console.error("EROARE în submitShopApplication:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.status(200).json([]);

    const users = await User.find({
      username: { $regex: query, $options: "i" } // Căutare parțială
    })
    .limit(5) // Limităm la 5 rezultate pentru dropdown
    .select("_id username displayName img"); // Luăm doar datele necesare

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Error searching users" });
  }
};

// 1. Obține lista cu cereri în așteptare
export const getPendingApplications = async (req, res) => {
  try {
    // Căutăm userii care au statusul PENDING în shopDetails
    const pendingUsers = await User.find({ "shopDetails.status": "PENDING" })
      .select("username email shopDetails img"); // Luăm doar datele necesare

    res.status(200).json(pendingUsers);
  } catch (err) {
    res.status(500).json({ message: "Error fetching applications" });
  }
};

// 2. Aprobă cererea (Transformă userul în SHOP)
export const approveShop = async (req, res) => {
  try {
    const { userId } = req.body; // ID-ul userului pe care îl aprobăm

    const updatedUser = await User.findByIdAndUpdate(userId, {
      role: "SHOP", // <--- AICI se schimbă rolul efectiv
      "shopDetails.status": "APPROVED",
      "shopDetails.approvedAt": new Date()
    }, { new: true });

    // Aici poți trimite și o notificare userului că a fost aprobat
    
    res.status(200).json({ message: "User aprobat! Acum este Magazin.", user: updatedUser });
  } catch (err) {
    res.status(500).json({ message: "Error approving user" });
  }
};

// 3. Respinge cererea
export const rejectShop = async (req, res) => {
  try {
    const { userId } = req.body;

    await User.findByIdAndUpdate(userId, {
      "shopDetails.status": "REJECTED"
      // Nu schimbăm rolul, rămâne USER
    });

    res.status(200).json({ message: "Cerere respinsă." });
  } catch (err) {
    res.status(500).json({ message: "Error rejecting user" });
  }
};