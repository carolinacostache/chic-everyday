import { Schema } from "mongoose";
import mongoose from "mongoose";

const pinSchema = new Schema(
  {
    media: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    link: {
      type: String,
    },
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
    },
    tags: {
      type: [String],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["standard", "contest"],
      default: "standard"
    },
    prize: {
      type: String,
    },
    deadline: {
      type: Date,
    },
    views: {
      type: Number,
      default: 0
    },
    linkClicks: {
      type: Number,
      default: 0
    },

  },
  { timestamps: true }
);

export default mongoose.model("Pin", pinSchema);