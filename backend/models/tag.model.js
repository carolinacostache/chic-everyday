import mongoose from "mongoose";

const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  type: { type: String, enum: ["weather", "category"], default: "weather" }}, { timestamps: true });

export default mongoose.model("Tag", tagSchema);