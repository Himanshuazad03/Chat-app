import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";
import Message from "../Models/messageModel.js";
import { io } from "../index.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { Readable } from "stream";

export const sendMessage = async (req, res) => {
  const { content, chatId, replyTo } = req.body;

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
      replyTo: replyTo || null,
    };

    // ❗ FIX: create first
    let newMessage = await Message.create(message);

    // ❗ FIX: then populate on the document
    newMessage = await newMessage.populate("sender", "name image");
    newMessage = await newMessage.populate("chat");
    newMessage = await newMessage.populate({
      path: "replyTo",
      populate: { path: "sender", select: "name image" },
    });

    newMessage = await User.populate(newMessage, {
      path: "chat.users",
      select: "name image email",
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: newMessage,
    });

    io.to(chatId).emit("messageRecieved", newMessage);

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
      .populate("chat")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name image" },
      });

    res.json(message);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { resource_type: "auto", folder: "chat_media" },
      async (error, result) => {
        if (error) {
          return res.status(500).json({ message: error.message });
        }
        let newMessage = await Message.create({
          sender: req.user._id,
          chat: req.body.chatId,
          mediaUrl: result.secure_url,
          publicId: result.public_id,
          isImage: result.resource_type === "image",
          isVideo: result.resource_type === "video",
          content:
            result.resource_type === "image"
              ? "Photo"
              : result.resource_type === "video"
              ? "Video"
              : "",
        });

        newMessage = await newMessage.populate("sender", "name image");
        newMessage = await newMessage.populate("chat").populate({
          path: "replyTo",
          populate: { path: "sender", select: "name image" },
        });

        newMessage = await User.populate(newMessage, {
          path: "chat.users",
          select: "name image email",
        });

        await Chat.findByIdAndUpdate(req.body.chatId, {
          latestMessage: newMessage,
        });

        // STEP 4: SEND THROUGH SOCKET
        io.to(req.body.chatId).emit("messageRecieved", newMessage);

        // STEP 5: RETURN MESSAGE TO CLIENT
        return res.status(200).json(newMessage);
      }
    );
    Readable.from(req.file.buffer).pipe(uploadStream);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { chatId, content } = req.body;
    const messageId = req.params.messageId;

    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Content cannot be empty" });
    }

    const message = await Message.findById(messageId).populate("chat");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Make sure user can only edit their own message
    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.content = content;
    message.isEdited = true;
    message.updatedAt = new Date();

    const updatedMsg = await message.save();
    const chat = await Chat.findById(chatId).select("latestMessage");
    if (chat.latestMessage?._id.toString() === messageId.toString()) {
      // update latestMessage because we edited the latest one
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: updatedMsg,
      });
    }

    let populatedMsg = await Message.findById(updatedMsg._id)
      .populate("sender", "name image _id")
      .populate("chat")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name image" },
      });

    populatedMsg = await User.populate(populatedMsg, {
      path: "chat.users",
      select: "name image email",
    });

    io.to(chatId).emit("messageUpdated", populatedMsg);
    if (chat.latestMessage?._id.toString() === messageId.toString()) {
      io.to(chatId).emit("messageRecieved", populatedMsg);
    }

    res.json(populatedMsg);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { chatId } = req.body;
    const messageId = req.params.messageId;

    const message = await Message.findById(messageId).populate("chat");

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not allowed" });
    }

    message.content = "This message was deleted";
    message.isDeleted = true;
    message.mediaUrl = null;
    message.isImage = false;
    message.isVideo = false;

    const updatedMsg = await message.save();
    const chat = await Chat.findById(chatId).select("latestMessage");

    if (chat.latestMessage?._id.toString() === messageId.toString()) {
      // update latestMessage because we edited the latest one
      await Chat.findByIdAndUpdate(chatId, {
        latestMessage: updatedMsg,
      });
    }

    let populatedMsg = await Message.findById(updatedMsg._id)
      .populate("sender", "name image _id")
      .populate("chat")
      .populate({
        path: "replyTo",
        populate: { path: "sender", select: "name image" },
      });

    populatedMsg = await User.populate(populatedMsg, {
      path: "chat.users",
      select: "name image email",
    });

    io.to(chatId).emit("messageUpdated", populatedMsg);
    if (chat.latestMessage?._id.toString() === messageId.toString()) {
      io.to(chatId).emit("messageRecieved", populatedMsg);
    }

    res.json(populatedMsg);
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

export const forwardMessage = async (req, res) => {
  try {
    const { chatId, content, mediaUrl, isImage, isVideo, forwardedFrom } =
      req.body;

    let newMessage = await Message.create({
      sender: req.user._id,
      content: content || "",
      chat: chatId,
      mediaUrl: mediaUrl || null,
      isImage: isImage || false,
      isVideo: isVideo || false,
      forwardedFrom, // userId
    });

    newMessage = await Message.findById(newMessage._id)
      .populate("sender", "name image")
      .populate({
        path: "chat",
        populate: { path: "users", select: "name image email" },
      })
      .populate("forwardedFrom", "name image"); // this is the FIX

    await Chat.findByIdAndUpdate(chatId, { latestMessage: newMessage });

    io.to(chatId).emit("messageRecieved", newMessage);

    res.json(newMessage);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
