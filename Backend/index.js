import express from "express";
const app = express();
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoute from "./routers/userRoute.js";
import chatRoute from "./routers/chatRoute.js";
import messageRoute from "./routers/messageRoute.js";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import http from "http";
import Message from "./Models/messageModel.js";
import cors from "cors";

const server = http.createServer(app);

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());

dotenv.config();
connectDB();

app.use("/api/user", userRoute);
app.use("/api/chat", chatRoute);
app.use("/api/message", messageRoute);

const PORT = process.env.PORT;

const io = new Server(server, {
  pingTimeout: 1200000,
  cors: {
    origin: true,
    credentials: true,
  },
});

export { io };

// 3️⃣ Socket.io events
io.on("connection", (socket) => {
  // console.log("Socket connected:", socket.id);

  socket.on("setup", (userData) => {
    socket.join(userData.id);
    socket.emit("connected");
  });

  socket.on("join chat", (room) => {
    socket.join(room);
  });

  socket.on("typing", ({ chatId, user }) => {
    socket.in(chatId).emit("typing", { user });
  });
  socket.on("stopTyping", (room) => socket.in(room).emit("stopTyping"));

  socket.on("newMessage", (newMessageRecieved) => {
    let chat = newMessageRecieved.chat;
    if (!chat?.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id.toString() === newMessageRecieved.sender._id.toString())
        return;
      socket
        .in(user._id.toString())
        .emit("messageRecieved", newMessageRecieved);
    });
  });

  socket.on("chatOpened", async ({ chatId, userId }) => {
    // 1. Update all unseen messages that were NOT sent by this user
    await Message.updateMany(
      {
        chat: chatId,
        sender: { $ne: userId },
        status: { $ne: "seen" },
      },
      { status: "seen" }
    );



    // 2. Get chat users
    const chat = await Message.findOne({ chat: chatId })
      .populate("chat")
      .catch((err) => console.log(err));

    if (!chat || !chat.chat) {
      return;
    }

    const users = chat.chat.users;

    // 3. Notify all OTHER users (not the one opening the chat)
    users.forEach((u) => {
      if (u.toString() !== userId.toString()) {
        socket.to(u.toString()).emit("messagesSeen", { chatId });
      }
    });
  });
  
  socket.off("setup", () => {
    console.log("USER DISCONNECTED");
    socket.leave(userData.id);
  });
});

// 4️⃣ Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
