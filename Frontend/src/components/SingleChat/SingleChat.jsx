import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  TextField,
  Typography,
  InputAdornment,
  Avatar,
} from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { setSelectedChat } from "../../Store/chatSlice";
import ProfileModal from "../ProfileModel/Profile";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupProfileModal from "../GroupProfileModal/GroupProfileModal";
import SnakeMessage from "../SnakeMessage/SnakeMessage";
import axios from "axios";
import { removeChat, updateChat, setNotification } from "../../Store/chatSlice";
import SkeletonList from "../ChatSkeleton/SkeletonList";
import MessageList from "../MessageUI/MessageList";
import SendIcon from "@mui/icons-material/Send";
import io from "socket.io-client";
import Lottie from "react-lottie";
import animationData from "../Animations/typing.json";
import MessageIcon from "@mui/icons-material/Message";
import CloseIcon from "@mui/icons-material/Close";
import AttachFileIcon from "@mui/icons-material/AttachFile";

const socket = io("http://localhost:4000");

let selectedChatCompare;

function SingleChat() {
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
  const { selectedChat, notifications, chats } = useSelector(
    (state) => state.chat
  );
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [groupProfileOpen, setGroupProfileOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [message, setMessage] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [typing, setTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [draftMedia, setDraftMedia] = useState(null);
  const dispatch = useDispatch();

  const fileInputRef = useRef();

  const handelMediaSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setDraftMedia({
      file: file,
      previewUrl: URL.createObjectURL(file),
      isImage: file.type.startsWith("image"),
      isVideo: file.type.startsWith("video"),
    });
    e.target.value = "";
  };

  const handelMediaUpload = async () => {
    if (!draftMedia || !selectedChat) return;

    const tempId = Date.now();

    // 1️⃣ Create temporary uploading message
    const tempMsg = {
      _id: tempId,
      sender: {
        _id: user.id,
        name: user.name,
        image: user.image,
      },
      isImage: draftMedia.isImage,
      isVideo: draftMedia.isVideo,
      mediaUrl: draftMedia.previewUrl, // local preview
      isUploading: true,
      uploadProgress: 0,
      chat: { _id: selectedChat._id },
      createdAt: new Date().toISOString(),
    };

    // 2️⃣ Remove draft preview
    setDraftMedia(null);

    // 3️⃣ Insert temp message into chat
    setMessage((prev) => [...prev, tempMsg]);

    const formData = new FormData();
    formData.append("media", draftMedia.file);
    formData.append("chatId", selectedChat._id);

    try {
      // 4️⃣ Upload with progress
      const { data } = await axios.post("/api/message/upload", formData, {
        withCredentials: true,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setMessage((prev) =>
            prev.map((m) =>
              m._id === tempId ? { ...m, uploadProgress: percent } : m
            )
          );
        },
      });

      // 5️⃣ Replace temp message with real server message
      const finalMsg = {
        ...data,
        sender: tempMsg.sender,
        isUploading: false,
      };

      setMessage((prev) => prev.map((m) => (m._id === tempId ? finalMsg : m)));

      // 6️⃣ Notify others & update chat list
      socket.emit("newMessage", finalMsg);
      dispatch(
        updateChat({
          ...selectedChat,
          latestMessage: finalMsg,
        })
      );
    } catch (error) {
      // 7️⃣ Remove temp message on failure
      setMessage((prev) => prev.filter((m) => m._id !== tempId));
      console.error("Upload failed", error);
    }
  };

  useEffect(() => {
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", ({ user }) => {
      setIsTyping(true);
      setTypingUser(user);
    });
    socket.on("stopTyping", () => setIsTyping(false));
    return () => socket.off("connected");
  }, []);
  const LeaveGroup = async (chatId) => {
    // Logic to leave the group chat

    try {
      const { data } = await axios.put(
        "/api/chat/leave",
        { chatId },
        { withCredentials: true }
      );

      dispatch(removeChat(selectedChat._id));
      dispatch(setSelectedChat(null));

      setSnack({
        open: true,
        message: "You left the group",
        type: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to leave the group",
        type: "error",
      });
    }
    dispatch(setSelectedChat(null));
  };

  const getSender = (loggedUser, users) => {
    if (!Array.isArray(users) || users.length < 2) return null;

    const loggedId = loggedUser.id ?? loggedUser._id;

    return users.find((u) => u._id !== loggedId) || users[0];
  };

  const fetchMessages = async () => {
    if (!selectedChat) return;
    try {
      setLoading(true);
      const { data } = await axios.get(`/api/message/${selectedChat._id}`, {
        withCredentials: true,
      });
      setMessage(data);
      setLoading(false);
      socket.emit("join chat", selectedChat._id);
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    selectedChatCompare = selectedChat;
  }, [selectedChat]);


  useEffect(() => {
    const handler = (msg) => {
      const isSystem = msg.isSystemMessage;
      const updatedChat = msg.chat;

      const existingChat = chats.find((c) => c._id === updatedChat._id);

      dispatch(
        updateChat({
          ...existingChat,
          ...updatedChat,
          latestMessage: isSystem ? existingChat?.latestMessage : msg,
        })
      );

      // Notifications (only for real messages)
      if (!selectedChatCompare || selectedChatCompare._id !== updatedChat._id) {
        if (!isSystem) {
          dispatch(setNotification(msg));
        }
      } else {
        // append to chat window
        setMessage((prev) => [...prev, msg]);
      }
    };

    socket.on("messageRecieved", handler);

    return () => socket.off("messageRecieved", handler);
  }, [selectedChat]);

  const sendMessage = async () => {
    if (newMessage) {
      socket.emit("stopTyping", selectedChat._id);
      try {
        const { data } = await axios.post(
          "/api/message",
          {
            content: newMessage,
            chatId: selectedChat._id,
          },
          { withCredentials: true }
        );
        socket.emit("newMessage", data);
        setMessage((prev) => [...(prev || []), data]);
        dispatch(
          updateChat({
            ...data.chat,
            latestMessage: data,
          })
        );
        setNewMessage("");
      } catch (error) {
        console.error("Failed to send message", error);
      }
    }
  };

  useEffect(() => {
    socket.on("groupUpdated", (updatedChat) => {
      dispatch(updateChat(updatedChat)); // replace chat in chat list
    });

    return () => socket.off("groupUpdated");
  }, []);

  useEffect(() => {
    socket.on("removedFromGroup", ({ chatId }) => {
      dispatch(removeChat(chatId)); // remove chat from chat list
      if (selectedChat?._id === chatId) {
        dispatch(setSelectedChat(null)); // close open chat
      }
    });

    return () => socket.off("removedFromGroup");
  }, [selectedChat, chats]);

  useEffect(() => {
    if (selectedChat) {
      socket.emit("chatOpened", {
        chatId: selectedChat?._id,
        userId: user?.id,
      });
    }
  }, [selectedChat]);

  useEffect(() => {
    socket.on("messagesSeen", ({ chatId }) => {
      setMessage((prev) =>
        prev.map((msg) =>
          msg.chat?._id === chatId &&
          msg.sender?._id === user?.id &&
          msg?.status !== "seen"
            ? { ...msg, status: "seen" }
            : msg
        )
      );
    });

    return () => socket.off("messagesSeen");
  }, []);

  const typingHandler = (e) => {
    setNewMessage(e.target.value);
    if (!typing) {
      setTyping(true);
      socket.emit("typing", {
        chatId: selectedChat._id,
        user: user,
      });
    }

    let lastTypingTime = new Date().getTime();
    var timerLength = 2500;
    setTimeout(() => {
      let timeNow = new Date().getTime();
      let timeDiff = timeNow - lastTypingTime;
      if (timeDiff >= timerLength && typing) {
        socket.emit("stopTyping", selectedChat._id);
        setTyping(false);
      }
    }, timerLength);
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Box
            py={1}
            px={2}
            fontSize={{ xs: "22px", md: "24px" }}
            display={"flex"}
            fontFamily={"sans-serif"}
            width={"100%"}
            justifyContent={"space-between"}
            alignItems={"center"}
            bgcolor={"lightgrey"}
          >
            <Box display={"flex"} gap={1} alignItems={"center"}>
              <IconButton
                sx={{ display: { md: "none" } }}
                onClick={() => {
                  dispatch(setSelectedChat(null));
                  // Dispatch action to deselect chat
                }}
              >
                <ArrowBackIcon />
              </IconButton>
              <Avatar
                src={
                  selectedChat?.isGroupChat
                    ? selectedChat?.image
                    : getSender(user, selectedChat.users)?.image
                }
                sx={{
                  width: 42,
                  height: 42,
                  border: "2px solid rgba(255,255,255,0.7)",
                }}
              />
              <Box display={"flex"} flexDirection={"column"}>
                <Typography
                  fontSize={{ xs: "24px", md: "30px" }}
                  fontFamily={"sans-serif"}
                  display={"flex"}
                >
                  {!selectedChat?.isGroupChat
                    ? getSender(user, selectedChat?.users)?.name
                    : selectedChat?.chatName}
                </Typography>
                <Box display={"flex"} gap={0.5}>
                  {selectedChat?.isGroupChat &&
                    selectedChat?.users.map((u) => {
                      return (
                        <span className="text-xs text-gray-600" key={u._id}>
                          {u._id !== user.id ? u.name : "You"},
                        </span>
                      );
                    })}
                </Box>
              </Box>
            </Box>
            <Box display={"flex"} gap={2}>
              <Button
                onClick={() => {
                  if (selectedChat.isGroupChat) {
                    setGroupProfileOpen(true);
                  } else {
                    setProfileOpen(true);
                  }
                }}
                variant="contained"
                size="small"
                sx={{
                  minWidth: "0", // remove default wide button
                  width: "45px", // equal width
                  height: "45px", // equal height → perfect circle
                  borderRadius: "50%", // make circular
                  padding: "0", // remove extra padding
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selectedChat.isGroupChat ? (
                  <PeopleAltIcon margin="none" />
                ) : (
                  <AccountBoxIcon margin="none" />
                )}
              </Button>
              {selectedChat.isGroupChat && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => LeaveGroup(selectedChat._id)}
                >
                  Leave
                </Button>
              )}
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            height={"100%"}
            width={"100%"}
            bgcolor={"#ECE5DD"}
            overflow={"hidden"}
          >
            <Box
              sx={{
                flexGrow: 1,
                display: "flex",
                overflowY: "auto",
                px: 2,
                py: 1,
                flexDirection: "column-reverse",
                "&::-webkit-scrollbar": {
                  width: "3px",
                },
                "&::-webkit-scrollbar-track": {
                  background: "#f1f1f1",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: "#888",
                  borderRadius: "16px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                  background: "#555",
                },
              }}
            >
              {draftMedia && (
                <Box
                  sx={{
                    p: 1,
                    mb: 1,
                    zIndex: 2,
                    borderRadius: 2,
                    bgcolor: "lightblue",
                    position: "fixed",
                    maxWidth: "300px",
                    // height: "fit-content",
                    // border: "2px solid #4caf50",
                    ml: 1,
                  }}
                >
                  {draftMedia.isImage && (
                    <img
                      src={draftMedia.previewUrl}
                      style={{ width: "100%", height: "auto", borderRadius: 8 }}
                    />
                  )}

                  {draftMedia.isVideo && (
                    <video
                      src={draftMedia.previewUrl}
                      style={{ width: "100%", borderRadius: 8 }}
                    />
                  )}
                  <IconButton sx={{ position: "absolute", top: 0, right: 0 }}>
                    <CloseIcon onClick={() => setDraftMedia(null)} />
                  </IconButton>

                  {/* Progress bar (only while uploading) */}
                </Box>
              )}
              {loading ? (
                <SkeletonList />
              ) : (
                <MessageList
                  messages={message}
                  currentUserId={user.id}
                  onMediaClick={(mediaUrl) => {
                    window.open(mediaUrl, "_blank");
                  }}
                />
              )}
            </Box>
            {isTyping && typingUser.id !== user.id && (
              <div className="flex gap-1 items-center">
                {selectedChat.isGroupChat && (
                  <Avatar
                    sx={{ width: 32, height: 32 }}
                    src={typingUser.image}
                    alt={typingUser.name}
                  />
                )}
                <Lottie
                  options={defaultOptions}
                  // height={50}
                  width={70}
                  style={{ marginBottom: 5, marginLeft: 0 }}
                />
              </div>
            )}

            <Box padding={"0 10px 10px 10px"}>
              <TextField
                placeholder="Enter Message"
                variant="filled"
                value={newMessage}
                onChange={typingHandler}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    if (draftMedia) {
                      handelMediaUpload();
                    } else {
                      sendMessage();
                    }
                  }
                }}
                InputProps={{
                  disableUnderline: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <IconButton onClick={() => fileInputRef.current.click()}>
                        <AttachFileIcon />
                      </IconButton>

                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*,video/*"
                        onChange={handelMediaSelect}
                        style={{ display: "none" }}
                      />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* File Upload Icon */}

                      {/* Send Message */}
                      <IconButton
                        onClick={() => {
                          if (draftMedia) {
                            handelMediaUpload();
                          } else {
                            sendMessage();
                          }
                        }}
                      >
                        <SendIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                fullWidth
              />
            </Box>
          </Box>
        </>
      ) : (
        <Box
          display={"flex"}
          flexDirection={"column"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <MessageIcon
            sx={{
              width: "250px",
              height: "250px",
              color: "gray",
              opacity: 0.5,
            }}
          />
          <Typography
            fontSize={"20px"}
            pb={3}
            fontFamily={"sans-serif"}
            color={"gray"}
          >
            Click on a user to start chatting
          </Typography>
        </Box>
      )}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={
          selectedChat
            ? selectedChat.users.find((u) => u._id !== user.id)
            : null
        }
      />
      <GroupProfileModal
        open={groupProfileOpen}
        onClose={() => setGroupProfileOpen(false)}
        users={selectedChat?.users}
      />
      <SnakeMessage
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
}

export default SingleChat;
