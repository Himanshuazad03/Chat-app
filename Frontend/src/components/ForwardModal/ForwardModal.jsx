import React, { useState } from "react";
import {
  Modal,
  Box,
  Typography,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import api from "../../api/axios";
import socket from "../../socket";
import { setSelectedChat, updateChat } from "../../Store/chatSlice";
import toast from "react-hot-toast";

const ForwardModal = ({ open, onClose, message }) => {
  const { chats } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [search, setSearch] = useState("");
  const [selectedChats, setSelectedChats] = useState([]);

  const filteredChats = chats.filter(
    (c) =>
      (c.isGroupChat
        ? c.chatName.toLowerCase().includes(search.toLowerCase())
        : c.users
            .find((u) => u._id !== user.id)
            ?.name.toLowerCase()
            .includes(search.toLowerCase())) && true
  );

  const toggleChat = (chatId) => {
    if (selectedChats.includes(chatId)) {
      setSelectedChats(selectedChats.filter((id) => id !== chatId));
    } else {
      setSelectedChats([...selectedChats, chatId]);
    }
  };

  const handleForward = async () => {
    if (!selectedChats.length) return;

    for (let chatId of selectedChats) {
      const payload = {};

      if (message.isImage || message.isVideo) {
        // forward media (copy)
        payload.mediaUrl = message.mediaUrl;
        payload.isImage = message.isImage;
        payload.isVideo = message.isVideo;
        payload.content = message.isImage ? "Photo" : "Video";
        payload.forwardedFrom = message.sender._id;
      } else {
        payload.content = message.content;
        payload.forwardedFrom = message.sender._id;
      }

      payload.chatId = chatId;

      try {
        const { data } = toast.promise(
          api.post("/api/message", payload),
          {
            loading: "Forwarding message...",
            success: "Message forwarded successfully",
            error: "Failed to forward message",
          }
        );
        dispatch(setSelectedChat(data.chat));
        dispatch(
          updateChat({
            ...data.chat,
            latestMessage: data,
          })
        );

        socket.emit("newMessage", data); // notify others
      } catch (error) {
        console.log("Forward failed:", error);
      }
    }

    onClose();
    setSelectedChats([]);
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          width: 350,
          bgcolor: "white",
          borderRadius: 2,
          p: 2,
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        }}
      >
        <Typography variant="h6" mb={1}>
          Forward Message
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search chats..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ mb: 1 }}
        />

        {/* Chat List */}
        <List sx={{ maxHeight: 260, overflowY: "auto" }}>
          {filteredChats.map((chat) => {
            const otherUser = chat.users.find((u) => u._id !== user.id);

            return (
              <ListItem
                key={chat._id}
                button
                selected={selectedChats.includes(chat._id)}
                onClick={() => toggleChat(chat._id)}
                sx={{
                  borderRadius: 1,
                  mb: 0.5,
                  cursor: "pointer",
                  bgcolor: selectedChats.includes(chat._id) ? "#e8eefe" : "",
                  transition: "0.2s",
                  "&.Mui-selected": {
                    bgcolor: "#e8eefe",
                    transform: "scale(1.02)",
                    boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
                  },
                }}
              >
                <ListItemAvatar>
                  <Avatar
                    src={chat.isGroupChat ? chat.image : otherUser?.image}
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={chat.isGroupChat ? chat.chatName : otherUser?.name}
                />
              </ListItem>
            );
          })}
        </List>

        {/* Buttons */}
        <Box mt={2} display="flex" justifyContent="space-between">
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!selectedChats.length}
            onClick={handleForward}
          >
            Forward
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ForwardModal;
