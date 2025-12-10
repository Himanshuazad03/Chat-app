import express from "express"
import { sendMessage, allMessage } from "../Controllers/messageController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
const router = express.Router();


router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, allMessage);

export default router;