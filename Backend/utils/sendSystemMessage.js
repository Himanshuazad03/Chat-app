import Message from "../Models/messageModel.js";
import Chat from "../Models/chatModel.js";
import { io } from "../index.js";

export const sendSystemMessage = async (chatId, content) => {
  const msg = await Message.create({
    chat: chatId,
    content,
    sender: null, // admin / person who triggered action
    isSystemMessage: true,
  });


  io.to(chatId.toString()).emit("messageRecieved", {
    ...msg._doc,
    isSystemMessage: true,
    sender: null,
    chat: { _id: chatId },
  });

  return msg;
};
