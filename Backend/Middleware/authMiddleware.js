import jwt from "jsonwebtoken";
import User from "../Models/userModel.js";

export const authMiddleware = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Please login" });

  try {
    const decode = jwt.verify(token, process.env.JWT_KEY);
    req.user = await User.findById(decode.id).select("-password");
    next();
  } catch (error) {
    return res.status(400).json({ message: "Invalid token" });
  }
};
