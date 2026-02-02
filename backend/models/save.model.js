import { Schema } from "mongoose";
import mongoose from "mongoose";

const saveSchema = new Schema(
  {
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
    board: {
      type: Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
  },
  { timestamps: true }
);

saveSchema.index({ pin: 1, user: 1, board: 1 }, { unique: true });

export default mongoose.model("Save", saveSchema);