import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { setChats } from "../../Store/chatSlice";
import axios from "axios";
import debounce from "../Debouncing/Debounce";
import { useMemo } from "react";
import UserListItems from "../Userlist/UserListItems";
import SnakeMessage from "../SnakeMessage/SnakeMessage";
import BadgeItems from "../BadgeItems/BadgeItems";
import { addChat, setSelectedChat } from "../../Store/chatSlice";
import { uploadToCloudinary } from "../utils/UploadToCloud";

function GroupChatModal({ children }) {
  const [groupChatName, setGroupChatName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupImage, setGroupImage] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);

  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { user } = useSelector((state) => state.auth);
  const { chats } = useSelector((state) => state.chat);
  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handelSearch = useMemo(
    () =>
      debounce(async (value, controller) => {
        try {
          setLoading(true);
          if (!value.trim()) {
            setLoading(false);
            return;
          }
          const { data } = await axios.get(`/api/user?search=${value}`, {
            withCredentials: true,
            signal: controller.signal,
          });
          setLoading(false);
          console.log(data);
          setSearchResults(data.users);
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.log(error.message);
          }
        }
      }, 400),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    if (!search.trim()) {
      controller.abort();
      setSearchResults([]);
      setLoading(false);
      return;
    }

    handelSearch(search, controller);
    return () => controller.abort();
  }, [search]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return null;
    setGroupImage(file);
    setUploadingImg(true);
    try {
      const url = await uploadToCloudinary(file);
      console.log(url);
      setGroupImage(url);
      setUploadingImg(false);
    } catch (err) {
      console.log("Cloudinary Upload Error:", err);
      setGroupImage(null);
      setSnack({
        open: true,
        message: "Image Upload Failed. Try again!",
        type: "error",
      });
      setUploadingImg(false);
      return null;
    }
  };

  const handelSubmit = async () => {
    if (!groupChatName || selectedUsers.length === 0) {
      setSnack({
        open: true,
        message: "Please fill all the fields",
        type: "error",
      });
      return;
    }
    if (selectedUsers.length < 2) {
      setSnack({
        open: true,
        message: "Add at least 2 users",
        type: "error",
      });
      return;
    }
    try {
      const { data } = await axios.post("/api/chat/group/", {
        name: groupChatName,
        users: JSON.stringify(selectedUsers.map((u) => u._id)),
        image: groupImage,
      });
      dispatch(addChat(data));
      setSnack({
        open: true,
        message: "New Group Chat Created!",
        type: "success",
      });
      dispatch(setSelectedChat(data));
      setGroupChatName("");
      setSelectedUsers([]);
      setSearch("");
      handleClose();
    } catch (error) {
      console.log("GROUP ERROR:", error.response?.data);
      setSnack({
        open: true,
        message: "Failed to Create the Chat!",
        type: "error",
      });
    }
  };

  const RemoveUser = (userToRemove) => {
    setSelectedUsers(
      selectedUsers.filter((sel) => sel._id !== userToRemove._id)
    );
  };

  const handleUserSelect = (userToAdd) => {
    if (selectedUsers.includes(userToAdd)) {
      setSnack({
        open: true,
        message: "User already added",
        type: "error",
      });
      return;
    }
    setSelectedUsers([...selectedUsers, userToAdd]);
  };
  return (
    <>
      <span onClick={handleOpen}>{children}</span>
      <Modal open={open} onClose={handleClose}>
        <Box
          className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[400px] bg-white shadow-2xl p-6 rounded-xl flex flex-col
        "
        >
          {/* Modal content goes here */}
          <Typography variant="h6" textAlign="center" mb={2}>
            Create Group Chat
          </Typography>
          <TextField
            sx={{ mb: 2 }}
            label="Group Chat Name"
            fullWidth
            value={groupChatName}
            onChange={(e) => setGroupChatName(e.target.value)}
          />
          <TextField
            sx={{ mb: 2 }}
            label="Add Users"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Box sx={{ mb: 2 }}>
            <Typography fontSize={14} mb={0.5}>
              Group Image (optional)
            </Typography>

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                textTransform: "none",
                borderStyle: "dashed",
                padding: "10px",
              }}
            >
              Upload Image
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleImageUpload}
              />
            </Button>

            {/* Preview */}
            {groupImage && (
              <Box mt={1} display="flex" justifyContent="center">
                <img
                  src={groupImage}
                  alt="Group Preview"
                  style={{ width: 80, height: 80, borderRadius: "50%" }}
                />
              </Box>
            )}

            {uploadingImg && (
              <Box display="flex" justifyContent="center" mt={1}>
                <CircularProgress size={28} />
              </Box>
            )}
          </Box>
          {/* {add selectedUsers} */}
          <Box display="flex" flexWrap="wrap" gap={1} mb={1}>
            {selectedUsers.map((user) => (
              <BadgeItems
                key={user._id}
                user={user}
                setSearch={setSearch}
                handleFunction={() => RemoveUser(user)}
              />
            ))}
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handelSubmit}
            sx={{ mb: 2 }}
          >
            Create Chat
          </Button>
          {loading && (
            <Box display="flex" justifyContent="center" mt={1}>
              <CircularProgress size={30} sx={{ color: "lightgray" }} />
            </Box>
          )}
          {/* Display search results */}
          {searchResults.slice(0, 3).map((user) => (
            <UserListItems
              overflowY="scroll"
              className="cursor-pointer gap-2"
              key={user._id}
              user={user}
              handleFunction={() => handleUserSelect(user)}
              clearSearch={() => setSearch("")}
            />
          ))}
        </Box>
      </Modal>
      <SnakeMessage
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack({ ...snack, open: false })}
      />
    </>
  );
}

export default GroupChatModal;
