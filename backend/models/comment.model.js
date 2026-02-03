import { Schema } from "mongoose";
import mongoose from "mongoose";

const commentSchema = new Schema(
  {
    description: {
      type: String,
      required: true,
    },

    // 👇 NOU: poza din comentariu (optional)
    img: {
      type: String,
      default: null,
    },

    pin: {
      type: Schema.Types.ObjectId,
      ref: "Pin",
      required: true,
    },

    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Comment", commentSchema);