import User from "../Models/userModel.js";
import Chat from "../Models/chatModel.js";

export const accessChat = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) return res.status(404).json({ message: "User not found" });

    let ischat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] },
    })
      .populate("users", "-password")
      .populate("latestMessage");

    if (ischat) {
      ischat = await User.populate(ischat, {
        path: "latestMessage.sender",
        select: "name image email",
      });

      return res.status(200).json(ischat);
    }

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId],
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    return res.status(201).json(fullChat);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const fetchChat = async (req, res) => {
  try {
    await Chat.find({ users: { $elemMatch: { $eq: req.user._id } } })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .populate("latestMessage")
      .sort({ updatedAt: -1 })
      .then(async (result) => {
        result = await User.populate(result, {
          path: "latestMessage.sender",
          select: "name image email",
        });
        return res.status(200).json({ result });
      });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const createGroup = async (req, res) => {
  try {
    let users = JSON.parse(req.body.users);

    if (users.length < 2) {
      return res.status(500).json({ message: "Add atleast 2 users" });
    }

    users.push(req.user);

    const groupChat = await Chat.create({
      chatName: req.body.name,
      users: users,
      isGroupChat: true,
      groupAdmin: req.user,
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    return res.status(200).json(fullGroupChat);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const renameGroup = async (req, res) => {
  try {
    const { chatId, chatName } = req.body;

    const updatedChat = await Chat.findByIdAndUpdate(
      chatId,
      { chatName },
      { new: true }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!updatedChat) {
      return res.status(404).json({ message: "Chat not found" });
    }

    return res.status(200).json(updatedChat);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const LeaveGroup = async (req, res) => {
  try {
    const { chatId } = req.body;
    const chat = await Chat.findById(chatId);

    chat.users = chat.users.filter(
      (u) => u.toString() !== req.user._id.toString()
    );

    if (chat.groupAdmin.toString() === req.user._id.toString()) {
      if (chat.users.length > 0) {
        chat.groupAdmin = chat.users[0]; // ⭐ auto promote new admin
      } else {
        chat.groupAdmin = null;
      }
    }

    await chat.save();
    const updated = await Chat.findById(chatId)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.json(updated);
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const addUser = async (req, res) => {
  try {
    const { userId, chatId } = req.body;

    const added = await Chat.findByIdAndUpdate(
      chatId,
      {
        $push: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!added) {
      res.status(404).json({ message: "chat not found" });
    } else {
      res.json(added);
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};

export const removeUser = async (req, res) => {
  try {
    const { userId, chatId } = req.body;

    const removed = await Chat.findByIdAndUpdate(
      chatId,
      {
        $pull: { users: userId },
      },
      {
        new: true,
      }
    )
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    if (!removed) {
      res.status.json({ message: "Chat not found" });
    } else{
      res.status(201).json(removed)
    }
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong",
      error: error.message,
    });
  }
};
