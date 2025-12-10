import React, { useState, useEffect } from "react";
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
  const { selectedChat, notifications } = useSelector((state) => state.chat);
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
  const dispatch = useDispatch();

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
      console.log(data);

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
    return users[0]._id === loggedUser.id ? users[1].name : users[0].name;
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

  console.log(notifications);

  useEffect(() => {
    const handler = (newMessageRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMessageRecieved.chat._id
      ) {
        // notification
        dispatch(setNotification(newMessageRecieved));
        dispatch(
          updateChat({
            ...newMessageRecieved.chat,
            latestMessage: newMessageRecieved,
          })
        );
      } else {
        setMessage((prev) => [...prev, newMessageRecieved]);
        dispatch(
          updateChat({
            ...newMessageRecieved.chat,
            latestMessage: newMessageRecieved,
          })
        );
      }
    };

    socket.on("messageRecieved", handler);

    return () => {
      socket.off("messageRecieved", handler);
    };
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
        console.log(data);
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
  }, [selectedChat]);

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
            <IconButton
              sx={{ display: { md: "none" } }}
              onClick={() => {
                dispatch(setSelectedChat(null));
                // Dispatch action to deselect chat
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              fontSize={{ xs: "24px", md: "30px" }}
              fontFamily={"sans-serif"}
            >
              {!selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName}
            </Typography>
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
              {loading ? (
                <SkeletonList />
              ) : (
                <MessageList messages={message} currentUserId={user.id} />
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
                  if (e.key === "Enter") sendMessage();
                }}
                InputProps={{
                  disableUnderline: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={sendMessage}>
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
