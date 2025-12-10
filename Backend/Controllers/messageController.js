import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";
import Message from "../Models/messageModel.js";

export const sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res
      .status(400)
      .json({ message: "Invalid data passed into request" });
  }

  try {
    let message = {
      sender: req.user._id,
      content: content,
      chat: chatId,
    };

    let newMessage = await Message.create(message);

    newMessage = await newMessage.populate("sender", "name image");
    newMessage = await newMessage.populate("chat");
    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "name image email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage,
    });

    res.json(newMessage);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const allMessage = async (req, res) => {
  try {
    const message = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name image email")
      .populate("chat");

    res.json(message);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
