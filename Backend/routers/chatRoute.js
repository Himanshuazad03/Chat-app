import express from "express"
const router = express.Router();
import { accessChat, fetchChat, createGroup, renameGroup, LeaveGroup, addUser, removeUser } from "../Controllers/chatController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";


router.post("/", authMiddleware, accessChat);
router.get("/", authMiddleware, fetchChat);
router.post("/group", authMiddleware, createGroup);
router.put("/rename", authMiddleware, renameGroup);
router.put("/leave", authMiddleware, LeaveGroup);
router.put("/addUser", authMiddleware, addUser);
router.put("/removeUser", authMiddleware, removeUser);

export default router

