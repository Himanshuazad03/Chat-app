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

const server = http.createServer(app);

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
    origin: "http://localhost:5173",
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
    if (!chat.users) return console.log("chat.users not defined");
    chat.users.forEach((user) => {
      if (user._id == newMessageRecieved.sender._id) return;
      socket.in(user._id).emit("messageRecieved", newMessageRecieved);
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
