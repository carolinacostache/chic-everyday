import mongoose from "mongoose";

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true }, // ID-ul Pin-ului sau Comentariului
  targetType: { type: String, enum: ["pin", "comment"], required: true },
  reason: { type: String, required: true },
  status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Report", reportSchema);