import express from 'express'
import { registerUser, loginUser, allUser, logoutUser } from '../Controllers/userControllers.js';
import { authMiddleware } from '../Middleware/authMiddleware.js';
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/",authMiddleware, allUser)
router.get("/logout", logoutUser);

export default router