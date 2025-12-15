import { Box } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import SingleChat from "../SingleChat/SingleChat";

function ChatBox() {
  const { selectedChat } = useSelector((state) => state.chat);
  return (
    <>
      <Box display={{ xs: selectedChat ? "flex" : "none", md: "flex" }}
        flexDirection={"column"}
        alignItems={"center"}
        bgcolor={"white"}
        width={{ xs: "100%", md: "69%" }}
        borderWidth={"1px"}
      >
        <SingleChat />
      </Box>
    </>
  );
}

export default ChatBox;
