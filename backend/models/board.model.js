import { Schema } from "mongoose";
import mongoose from "mongoose";

const boardSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isSecret: {
      type: Boolean,
      default: false,
    },
    collaborators: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }]
  },
  { timestamps: true }
);

export default mongoose.model("Board", boardSchema);