import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') }); 

import User from "../models/user.model.js";
import Pin from "../models/pin.model.js";
import Board from "../models/board.model.js";
import Comment from "../models/comment.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Follow from "../models/follow.model.js";

import bcrypt from "bcryptjs";
import connectDB from "./connectDB.js";
import mongoose from "mongoose";

// --- LISTA DE ȚINUTE REALE (Curated from Unsplash) ---
const outfitSamples = [
  // WINTER (Iarnă)
  {
    url: "https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=800&q=80",
    weather: "winter",
    title: "Cozy Winter Coat",
    desc: "Perfect wool coat for cold days."
  },
  {
    url: "https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&q=80",
    weather: "winter",
    title: "Street Style Layering",
    desc: "Keeping warm and stylish."
  },
  {
    url: "https://images.unsplash.com/photo-1520591799316-6b30425429aa?w=800&q=80",
    weather: "winter",
    title: "Winter Knits",
    desc: "Comfortable sweater weather outfit."
  },

  // SUMMER (Vară)
  {
    url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&q=80",
    weather: "summer",
    title: "Summer Dress",
    desc: "Light and breezy for hot days."
  },
  {
    url: "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80",
    weather: "summer",
    title: "Casual Tee",
    desc: "Simple summer look."
  },
  {
    url: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800&q=80",
    weather: "summer",
    title: "Boho Summer Style",
    desc: "Festival vibes."
  },

  // RAINY / CLOUDY (Ploaie/Nori)
  {
    url: "https://ik.imagekit.io/carolina/test/06318023700-a1_djn-UK-uS.jpg?updatedAt=1765968178886",
    weather: "rainy",
    title: "Rainy Day Mood",
    desc: "Stay dry with this trench coat."
  },
  {
    url: "https://ik.imagekit.io/carolina/test/06318023700-a1_djn-UK-uS.jpg?updatedAt=1765968178886",
    weather: "cloudy",
    title: "Overcast Elegance",
    desc: "Perfect for grey skies."
  },
  {
    url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&q=80",
    weather: "rainy",
    title: "Jacket Weather",
    desc: "Essential jacket for rainy days."
  },

  // SUNNY / CASUAL (Soare)
  {
    url: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800&q=80",
    weather: "sunny",
    title: "Denim & Heels",
    desc: "Chic sunny day outfit."
  },
  {
    url: "https://images.unsplash.com/photo-1506634572416-48cdfe530110?w=800&q=80",
    weather: "sunny",
    title: "Golden Hour Look",
    desc: "Shining bright."
  },

  // FOGGY (Ceață)
  {
    url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=800&q=80",
    weather: "foggy",
    title: "Mysterious Vibes",
    desc: "Minimalist look for foggy mornings."
  }
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log("MongoDB Conectat pentru seeding...");
    
    // Curățăm baza de date
    await User.deleteMany({});
    await Pin.deleteMany({});
    await Board.deleteMany({});
    await Comment.deleteMany({});
    await Like.deleteMany({});
    await Save.deleteMany({});
    await Follow.deleteMany({});
    console.log("Datele vechi au fost șterse.");

    // 1. CREEAZĂ UTILIZATORI
    console.log("Creez utilizatori...");
    const users = [];
    
    // Adăugăm un user SHOP pentru teste de concurs
    const hashedPassword = await bcrypt.hash("password123", 10);
    const shopUser = new User({
      displayName: `Fashion Brand Store`,
      username: `fashionbrand`,
      email: `shop@example.com`,
      hashedPassword: hashedPassword,
      img: `https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=200&q=80`,
      role: "SHOP",
      shopDetails: {
         website: "https://fashionbrand.com",
         status: "VERIFIED",
         verifiedAt: new Date()
      }
    });
    users.push(await shopUser.save());

    // Useri normali
    for (let i = 1; i <= 10; i++) {
      // Folosim poze de profil reale (portrete)
      const avatarUrl = `https://images.unsplash.com/photo-${
        i % 2 === 0 ? '1534528741775-53994a69daeb' : '1507003211169-0a1dd7228f2d'
      }?w=200&h=200&fit=crop`;

      const user = new User({
        displayName: `User ${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
        hashedPassword: hashedPassword,
        img: avatarUrl,
        gamification: {
            points: Math.floor(Math.random() * 500),
            level: Math.floor(Math.random() * 5) + 1,
            badges: []
        }
      });
      users.push(await user.save());
    }
    console.log(`${users.length} utilizatori creați.`);

    // 2. CREEAZĂ BOARD-URI
    console.log("Creez board-uri...");
    const boards = [];
    for (const user of users) {
      for (let i = 1; i <= 2; i++) {
        const board = new Board({
          title: `Inspiration ${i}`,
          user: user._id,
        });
        boards.push(await board.save());
      }
    }
    console.log(`${boards.length} board-uri create.`);

    // 3. CREEAZĂ PIN-URI (ȚINUTE)
    console.log("Creez pin-uri cu ținute reale...");
    const pins = [];

    for (const user of users) {
      const userBoards = boards.filter(
        (board) => board.user.toString() === user._id.toString()
      );
      
      // Fiecare user creează 3-5 postări
      const numPosts = Math.floor(Math.random() * 3) + 3; 

      for (let i = 0; i < numPosts; i++) {
        // Alegem o ținută random din lista noastră curatoriată
        const outfit = outfitSamples[Math.floor(Math.random() * outfitSamples.length)];
        
        // Tag-uri: Meteo corect + alte tag-uri
        const allTags = [outfit.weather, "fashion", "ootd", "style"];

        // Determinăm dacă e concurs (doar dacă userul e SHOP)
        const isContest = user.role === "SHOP" && i === 0; // Prima postare a shop-ului e concurs

        const pin = new Pin({
          media: outfit.url,
          width: 800,
          height: 1000, // Aspect ratio portret pt modă
          title: isContest ? `CONCURS: ${outfit.title}` : outfit.title,
          description: isContest 
            ? `Participă acum și câștigă! ${outfit.desc}` 
            : `${outfit.desc} Posted by ${user.username}`,
          link: `https://example.com/item${i}`,
          board: userBoards.length > 0 ? userBoards[0]._id : null,
          tags: allTags,
          user: user._id,
          type: isContest ? "contest" : "standard",
          prize: isContest ? "Voucher 500 RON" : null,
          deadline: isContest ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null // +7 zile
        });
        
        pins.push(await pin.save());
      }
    }
    console.log(`${pins.length} pin-uri create.`);

    // 4. CREEAZĂ COMENTARII
    console.log("Creez comentarii...");
    const commentsTexts = [
        "Love this look! 😍", 
        "Where did you get that?", 
        "Perfect for this weather.", 
        "So chic!", 
        "Amazing style 🔥"
    ];

    for (const user of users) {
      for (let i = 0; i < 3; i++) {
        const randomPin = pins[Math.floor(Math.random() * pins.length)];
        const randomText = commentsTexts[Math.floor(Math.random() * commentsTexts.length)];
        
        const comment = new Comment({
          description: randomText,
          pin: randomPin._id,
          user: user._id,
        });
        await comment.save();
      }
    }

    // 5. INTERACȚIUNI (Likes, Saves, Follows)
    console.log("Creez interacțiuni...");
    for (const user of users) {
      // Likes
      for (let i = 0; i < 5; i++) {
        const randomPin = pins[Math.floor(Math.random() * pins.length)];
        // Verificăm duplicat
        const exists = await Like.findOne({ user: user._id, pin: randomPin._id });
        if (!exists) {
            await Like.create({ user: user._id, pin: randomPin._id });
            // Incrementăm stats interne (opțional, dacă ai logica în model)
            await Pin.findByIdAndUpdate(randomPin._id, { $inc: { likes: 1 } });
        }
      }
      
      // Saves
      for (let i = 0; i < 3; i++) {
        const randomPin = pins[Math.floor(Math.random() * pins.length)];
        const randomBoard = boards.find(b => b.user.toString() === user._id.toString());
        if (randomBoard) {
             const exists = await Save.findOne({ user: user._id, pin: randomPin._id });
             if (!exists) {
                await Save.create({ user: user._id, pin: randomPin._id, board: randomBoard._id });
             }
        }
      }

      // Follows
      for (let i = 0; i < 2; i++) {
        const randomUser = users[Math.floor(Math.random() * users.length)];
        if (user._id.toString() !== randomUser._id.toString()) {
           const exists = await Follow.findOne({ follower: user._id, following: randomUser._id });
           if (!exists) {
              await Follow.create({ follower: user._id, following: randomUser._id });
           }
        }
      }
    }
    console.log("Interacțiuni create.");

    console.log("🎉 Database seeded successfully with REAL OUTFITS!");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log("Deconectat de la MongoDB.");
    process.exit(0);
  }
};

seedDB();