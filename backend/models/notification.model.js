import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  sender: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["follow", "like", "comment", "contest_win"], 
    required: true 
  },
  pin: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pin" 
  },
  text: {
      type: String, // Asigură-te că ai și acest câmp pentru mesajul personalizat
    },
  isRead: { 
    type: Boolean, 
    default: false 
  },
}, { timestamps: true });

export default mongoose.model("Notification", notificationSchema);