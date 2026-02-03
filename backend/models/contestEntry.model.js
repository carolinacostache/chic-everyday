import mongoose from "mongoose";

const ContestEntrySchema = new mongoose.Schema(
  {
    contest: { type: mongoose.Schema.Types.ObjectId, ref: "Pin", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // URL (ImageKit) sau path local (dar tu vrei ImageKit)
    image: { type: String, required: true },

    comment: { type: String, default: "" },

    // ✅ NOU: lista userilor care au dat like
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default mongoose.model("ContestEntry", ContestEntrySchema);