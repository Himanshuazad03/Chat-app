import mongoose from "mongoose";

const chatModel = mongoose.Schema(
  {
    chatName: { type: String, trim: true },
    isGroupChat: { type: Boolean, default: false },
    image: {
      type: String,
      trim: true,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSGWtVvYVDYI2fdQJqJm-MUWQv5e183oUtA5Q&s",
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Chat = mongoose.model("Chat", chatModel);

export default Chat;
