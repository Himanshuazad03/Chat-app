import { Box } from "@mui/material";
import React from "react";
import { useSelector } from "react-redux";
import SingleChat from "../SingleChat/SIngleChat";

function ChatBox() {
  const { selectedChat } = useSelector((state) => state.chat);
  return (
    <>
      <Box display={{ xs: selectedChat ? "flex" : "none", md: "flex" }}
        flexDirection={"column"}
        alignItems={"center"}
        p={2}
        bgcolor={"white"}
        width={{ xs: "100%", md: "69%" }}
        borderRadius={"10px"}
        borderWidth={"1px"}
      >
        <SingleChat />
      </Box>
    </>
  );
}

export default ChatBox;
