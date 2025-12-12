import axios from "axios";

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "chat-app");
  formData.append("cloud_name", "dnn9xe0ee");

  try {
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/dnn9xe0ee/image/upload`,
      formData,
      { withCredentials: false }
    );
    console.log(res.data.secure_url);
    return res.data.secure_url; // 🔥 Final Cloudinary URL
  } catch (err) {
    console.log("Cloudinary Upload Error:", err);
    return null;
  }
};