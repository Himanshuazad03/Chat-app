import express from "express"
const app = express()
import dotenv from "dotenv"
import connectDB from "./config/db.js"
import userRoute from "./routers/userRoute.js"
import chatRoute from "./routers/chatRoute.js"
import cookieParser from "cookie-parser"
import path from 'path'

app.use(cookieParser())
app.use(express.json())

dotenv.config();
connectDB();

app.use("/api/user", userRoute)
app.use("/api/chat", chatRoute);


const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
