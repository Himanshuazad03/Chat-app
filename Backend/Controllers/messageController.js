import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";
import Message from "../Models/messageModel.js";
import { io } from "../index.js";
import cloudinary from "../config/cloudinary.js";
import multer from "multer";
import { Readable } from "stream";
import e from "express";

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
        newMessage = await newMessage.populate("chat");

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
