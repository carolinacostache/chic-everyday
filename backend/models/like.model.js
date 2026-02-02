import { Schema } from "mongoose";
import mongoose from "mongoose";

const likeSchema = new Schema(
  {
    pin: {
      type: Schema.Types.ObjectId,
      ref:"Pin",
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

likeSchema.index({ pin: 1, user: 1 }, { unique: true });

export default mongoose.model("Like", likeSchema);