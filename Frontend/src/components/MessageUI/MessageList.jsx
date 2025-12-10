import React, { useEffect, useRef } from "react";
import { Box } from "@mui/material";
import MessageBubble from "./MessageBubble";
import MessageDate from "./MessageDate";
import formatDate from "./formateDate.js";

function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  // Auto-scroll every time messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  let lastDate = "";

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      {messages.map((msg, index) => {
        const msgDate = formatDate(msg.createdAt);
        const showDate = msgDate !== lastDate;
        lastDate = msgDate;

        return (
          <React.Fragment key={msg._id || index}>
            {showDate && <MessageDate date={msgDate} />}
            <MessageBubble msg={msg} isOwn={msg.sender._id === currentUserId} />
          </React.Fragment>
        );
      })}

      <div ref={bottomRef} />
    </Box>
  );
}

export default MessageList;
