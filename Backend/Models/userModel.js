import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  name: { type: String, trim: true, required: true },
  email: {type: String, required: true, trim: true},
  password: {type: String, required: true},
  image:{
    type: String,
    default: "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg",
  },
  isAdmin: {
    type: Boolean,
    required: true,
    default: false
  }
});

const User = mongoose.model("User", userSchema)
export default User
