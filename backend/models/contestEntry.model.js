import mongoose from "mongoose";

const ContestEntrySchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Pin", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    image: { type: String, required: true },
    comment: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("ContestEntry", ContestEntrySchema);