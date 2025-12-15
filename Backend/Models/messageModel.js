import mongoose from "mongoose";

const messageModel = mongoose.Schema(
  {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: { type: String, trim: true },
    chat: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
    isSystemMessage: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["sent", "delivered", "seen"],
      default: "sent",
    },
    mediaUrl: { type: String, default: null },
    publicId: { type: String, default: null },
    isImage: { type: Boolean, default: false },
    isVideo: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Message = mongoose.model("Message", messageModel);
export default Message;
