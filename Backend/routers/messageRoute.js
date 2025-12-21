import express from "express";
import {
  sendMessage,
  allMessage,
  uploadMedia,
  editMessage,
  deleteMessage,
  forwardMessage
} from "../Controllers/messageController.js";
import { authMiddleware } from "../Middleware/authMiddleware.js";
import { uploadCloud } from "../Middleware/uploadMiddleware.js";
const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/:chatId", authMiddleware, allMessage);
router.post("/upload", authMiddleware, uploadCloud, uploadMedia);
router.put("/:messageId", authMiddleware, editMessage)
router.delete("/:messageId", authMiddleware, deleteMessage)
router.post("/forward", authMiddleware, forwardMessage)

export default router;
