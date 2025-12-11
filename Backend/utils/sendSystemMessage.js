import Message from "../Models/messageModel.js";
import Chat from "../Models/chatModel.js";
import { io } from "../index.js";

export const sendSystemMessage = async (chatId, content, senderId) => {
  const msg = await Message.create({
    chat: chatId,
    content,
    sender: senderId, // admin / person who triggered action
    isSystemMessage: true,
  });

  const fullMsg = await msg.populate("sender", "name image");
  const chat = await Chat.findById(chatId)
    .populate("users", "-password") // full user object with _id
    .populate("groupAdmin", "-password")
    .populate({
      path: "latestMessage",
      populate: { path: "sender", select: "name image email" },
    });

  io.to(chatId.toString()).emit("messageRecieved", {
    ...msg._doc,
    sender: { name: "System" },
    chat: { _id: chatId },
  });

  return fullMsg;
};
