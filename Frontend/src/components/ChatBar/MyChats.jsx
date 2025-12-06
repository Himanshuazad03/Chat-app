import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { Box, Button, Stack } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { setSelectedChat, setChats } from "../../Store/chatSlice";
import GroupChatModal from "../GroupChatModal/GroupChatModal";

function MyChats() {
  const { user } = useSelector((state) => state.auth);
  const { selectedChat, chats } = useSelector((state) => state.chat);
  const dispatch = useDispatch();

  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser.id ? users[1].name : users[0].name;
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
        flexDirection={"column"}
        alignItems={"center"}
        p={2}
        bgcolor={"white"}
        width={{ xs: "100%", md: "31%" }}
        borderRadius={"10px"}
        borderWidth={"1px"}
        mr={2}
      >
        <Box
          pb={3}
          px={2}
          fontSize={{ xs: "22px", md: "30px" }}
          display={"flex"}
          fontFamily={"sans-serif"}
          width={"100%"}
          justifyContent={"space-between"}
          alignItems={"center"}
        >
          My Chats
          <GroupChatModal>
            <Button
              display={"flex"}
              variant="contained"
              sx={{
                fontSize: { xs: "15px", md: "10px" },
                "& .MuiButton-startIcon": {
                  mr: 0,
                  ml: 0,
                },
              }}
              startIcon={<AddIcon sx={{ mr: 0 }} />}
            >
              <span className="hidden lg:block">New Group Chat</span>
            </Button>
          </GroupChatModal>
        </Box>
        <Box
          display={"flex"}
          flexDirection={"column"}
          p={2}
          bgcolor={"#F8F8F8"}
          width={"100%"}
          height={"100%"}
          borderRadius={"10px"}
          overflowY={"hidden"}
        >
          {/* Chats will be loaded here */}
          {chats.length > 0 ? (
            <Stack overflowY="scroll">
              {chats.map((chat) => (
                <Box
                  key={chat._id}
                  sx={{ cursor: "pointer" }}
                  onClick={() => dispatch(setSelectedChat(chat))}
                  bgcolor={
                    selectedChat?._id === chat._id ? "#38B2AC" : "#E8E8E8"
                  }
                  color={selectedChat?._id === chat._id ? "white" : "black"}
                  px={2}
                  py={1.5}
                  borderRadius="10px"
                  mb={2}
                >
                  <span>
                    {!chat.isGroupChat
                      ? getSender(user, chat.users)
                      : chat.chatName}
                  </span>
                </Box>
              ))}
            </Stack>
          ) : (
            <div>No chats found</div>
          )}
        </Box>
      </Box>
    </>
  );
}

export default MyChats;
