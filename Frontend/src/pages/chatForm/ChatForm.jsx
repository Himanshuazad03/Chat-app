import React from "react";
import { useEffect } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import { Box, Skeleton, Stack } from "@mui/material";
import Header from "../../components/Header/Header";
import MyChats from "../../components/ChatBar/MyChats";
import ChatBox from "../../components/ChatBox/ChatBox";

function ChatForm() {
  const { user } = useSelector((state) => state.auth);
  return (
    <div style={{ width: "100%", height: "100vh", background: "linear-gradient(to bottom right, #dbeafe, #bfdbfe, #93c5fd)" }}>
      <Box
        display={"flex"}
        width={"100%"}
        height={"100vh"}
        >
        {user && <Header />}
        {user && <MyChats />}
        {user && <ChatBox />}
      </Box>
    </div>
  );
}

export default ChatForm;
