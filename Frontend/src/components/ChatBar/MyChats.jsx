import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Box, Button, Stack, Tooltip, Typography, Avatar } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import {
  setSelectedChat,
  setChats,
  setNotification,
  clearNotifications,
} from "../../Store/chatSlice";
import GroupChatModal from "../GroupChatModal/GroupChatModal";
import { get } from "mongoose";

function MyChats() {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat, chats, notifications } = useSelector(
    (state) => state.chat
  );
  const dispatch = useDispatch();

  const getSender = (loggedUser, users) => {
    if (!Array.isArray(users) || users.length < 2) return null;

    const loggedId = loggedUser.id ?? loggedUser._id;

    return users.find((u) => u._id !== loggedId) || users[0];
  };

  // Get unread count for a specific chat
  const getUnreadCount = (chatId) => {
    return notifications.filter((n) => n.chat._id === chatId).length;
  };

  const getDisplaySender = (msg) => {
    if (!msg || msg.isSystemMessage) return "";

  if (!msg.sender || typeof msg.sender === "string") return "";

  const isOwn = msg?.sender._id === user?.id;
  return isOwn ? "You: " : `${msg.sender.name}: `;
  };

  // Get latest notification for a chat
  const getLatestNotification = (chatId) => {
    const chatNotifications = notifications.filter(
      (n) => n.chat._id === chatId
    );
    return chatNotifications.length > 0 ? chatNotifications[0] : null;
  };

  const fetchChats = async () => {
    try {
      const response = await axios.get("/api/chat", { withCredentials: true });
      dispatch(setChats(response.data.result));
    } catch (error) {
      console.error("Failed to load the chats", error);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  return (
    <>
      <Box
        display={{ xs: selectedChat ? "none" : "flex", md: "flex" }}
        flexDirection="column"
        bgcolor="#FFFFFF"
        width={{ xs: "100%", md: "31%" }}
        height="100%"
        borderRight="1px solid #e5e5e5"
        sx={{ overflow: "hidden" }}
      >
        {/* HEADER */}
        <Box
          px={2}
          py={2}
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          bgcolor="#f7f9fc"
          borderBottom="1px solid #ececec"
        >
          <Typography fontSize="22px" fontWeight={700}>
            Chats
          </Typography>

          <GroupChatModal>
            <Tooltip title="New Group Chat">
              <Button
                variant="contained"
                size="small"
                sx={{
                  backgroundColor: "#3e6dcc",
                  textTransform: "none",
                  minWidth: "0",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  padding: "0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 600,
                  "&:hover": { backgroundColor: "#225bce" },
                  "&:marginRight": "none",
                }}
              >
                <AddIcon sx={{ fontSize: 26 }} />
              </Button>
            </Tooltip>
          </GroupChatModal>
        </Box>

        {/* CHAT LIST */}
        <Box
          flex={1}
          overflow="auto"
          bgcolor="#F7F7F7"
          padding={1.7}
          sx={{
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
          {chats.length > 0 ? (
            <Stack spacing={0.5}>
              {chats.map((chat) => {
                const isSelected = selectedChat?._id === chat._id;
                const unreadCount = getUnreadCount(chat._id);
                const latestNotification = getLatestNotification(chat._id);

                // Determine what message to display
                const displayMessage = latestNotification || chat.latestMessage;

                return (
                  <Box
                    key={chat._id}
                    onClick={() => {
                      dispatch(setSelectedChat(chat));
                      dispatch(clearNotifications(chat._id));
                    }}
                    sx={{
                      cursor: "pointer",
                      p: 1.65,
                      borderRadius: "8px",
                      backgroundColor: isSelected ? "#d6d7db" : "#F7F7F7",
                      transition: "0.2s ease",
                      "&:hover": {
                        backgroundColor: isSelected ? "none" : "#eaeaec",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} alignItems="center">
                      {/* Avatar Placeholder */}
                      <Avatar
                        src={
                          chat?.isGroupChat
                            ? chat?.image
                            : getSender(user, chat.users)?.image
                        }
                        sx={{
                          width: 42,
                          height: 42,
                          border: "2px solid rgba(255,255,255,0.7)",
                        }}
                      />

                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        {/* Name + Time */}
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            fontWeight={unreadCount > 0 ? 700 : 600}
                            fontSize="16px"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {!chat.isGroupChat
                              ? getSender(user, chat.users)?.name
                              : chat.chatName}
                          </Typography>

                          <Typography
                            fontSize="12px"
                            color={unreadCount > 0 ? "#25D366" : "#777"}
                            fontWeight={unreadCount > 0 ? 460 : 300}
                            sx={{ whiteSpace: "nowrap", ml: 1 }}
                          >
                            {displayMessage
                              ? new Date(
                                  displayMessage?.createdAt
                                ).toLocaleTimeString("en-GB", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })
                              : ""}
                          </Typography>
                        </Stack>

                        {/* Last message preview + Unread badge */}
                        <Stack
                          direction="row"
                          alignItems="center"
                          justifyContent="space-between"
                          spacing={1}
                        >
                          <Typography
                            fontSize="14px"
                            color={unreadCount > 0 ? "#000" : "#666"}
                            fontWeight={unreadCount > 0 ? 460 : 300}
                            mt={0.5}
                            sx={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              flex: 1,
                            }}
                          >
                            
                            {chat?.isGroupChat &&
                              getDisplaySender(displayMessage)}

                            {displayMessage
                              ? displayMessage.content?.length > 60
                                ? displayMessage.content?.substring(0, 60) +
                                  "..."
                                : displayMessage?.content
                              : "Start the conversation..."}
                          </Typography>

                          {/* Unread Count Badge */}
                          {unreadCount > 0 && (
                            <Box
                              sx={{
                                minWidth: "22px",
                                height: "22px",
                                borderRadius: "50%",
                                backgroundColor: "#25D366",
                                color: "#fff",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: "12px",
                                fontWeight: 700,
                                px: unreadCount > 9 ? 0.7 : 0,
                                flexShrink: 0,
                              }}
                            >
                              {unreadCount > 99 ? "99+" : unreadCount}
                            </Box>
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </Box>
                );
              })}
            </Stack>
          ) : (
            <Typography p={3} textAlign="center" color="gray">
              No chats found
            </Typography>
          )}
        </Box>
      </Box>
    </>
  );
}

export default MyChats;
