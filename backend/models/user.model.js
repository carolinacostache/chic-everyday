import { Schema } from "mongoose";
import mongoose from "mongoose";

const userSchema = new Schema(
  {
    displayName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    img: {
      type: String
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    followers: {
      type: [String], // Lista de ID-uri ale celor care mă urmăresc
      default: []
    },
    following: {
      type: [String], // Lista de ID-uri ale celor pe care îi urmăresc eu (CRITIC PENTRU FEED)
      default: []
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },

    role: {
      type: String,
      enum: ["USER", "SHOP", "ADMIN", "BANNED"],
      default: "USER"
    },

    bannedAt: { 
      type: Date 
    },
    
    banReason: { 
      type: String 
    },
    
    shopDetails: {
      verificationDocument: { type: String },
      status: {
        type: String,
        enum: ["NONE", "PENDING", "VERIFIED", "REJECTED"],
        default: "NONE"
      },
      website: { type: String },
      level: { 
        type: String, 
        enum: ["Bronze", "Silver", "Gold", "Platinum"], 
        default: "Bronze" 
      }
    },

    gamification: {
      points: { type: Number, default: 0 },
      level: { type: Number, default: 1 },
      badges: [
        {
          name: { type: String }, 
          icon: { type: String },
          awardedAt: { type: Date, default: Date.now }
        }
      ]
    },
    stats: {
      totalPosts: { type: Number, default: 0 },
      totalComments: { type: Number, default: 0 },
      totalLikesReceived: { type: Number, default: 0 }
    }

  },
  { timestamps: true }
);

export default mongoose.model("User",userSchema)