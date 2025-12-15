import User from "../Models/userModel.js";
import bcrypt from "bcrypt";
import generateToken from "../config/generateToken.js";
import dotenv from "dotenv";

dotenv.config();

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = generateToken(user._id);
    const isProd = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      secure: isProd, // REQUIRED on Render
      sameSite: isProd ? "none" : "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const safeUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      image: user.image,
      token,
    };

    return res.json({ message: "Login successful", user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, image } = req.body;

    const user = await User.findOne({ email });

    if (user) return res.status(400).json({ messge: "User already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const createdUser = await User.create({
      name,
      email,
      password: hashed,
    });

    if (image) {
      createdUser.image = image;
      await createdUser.save();
    }

    res.status(201).json({
      message: "Signup successful",
      _id: createdUser._id,
      email: createdUser.email,
      image: createdUser.image,
      isAdmin: createdUser.isAdmin,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const allUser = async (req, res) => {
  try {
    const search = req.query.search?.trim();

    const keyword = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const users = await User.find({
      ...keyword,
      _id: { $ne: req.user._id },
    });

    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const logoutUser = (req, res) => {
 const isProd = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/",
  });

  res.status(200).json({ message: "Logout successful" });
};
