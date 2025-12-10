import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useSelector } from "react-redux";

function MessageBubble({ msg, isOwn }) {
  const { selectedChat } = useSelector((state) => state.chat);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Avatar should show for every "other" user (group or private)

  return (
    <Box
      display="flex"
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      mt={1.5}
      gap={1}
    >
      {/* Avatar only for other user's messages */}
      {!isOwn && selectedChat.isGroupChat && (
        <Avatar
          sx={{ width: 32, height: 32 }}
          src={msg.sender.image}
          alt={msg.sender.name}
        />
      )}

      {/* Message bubble */}
      <Box
        sx={{
          position: "relative",
          maxWidth: "70%",
          bgcolor: isOwn ? "#DCF8C6" : "#FFFFFF",
          px: 1.5,
          py: 0.7,
          borderRadius: 1,
          borderTopRightRadius: isOwn ? 0 : 5,
          borderTopLeftRadius: isOwn ? 5 : 0,
          boxShadow: "0px 1px 2px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 0,

          "&::before": {
            content: '""',
            position: "absolute",
            top: 0, // lowers the notch a little (looks more WhatsApp-like)
            width: 0,
            height: 0,
            borderStyle: "solid",
            borderWidth: isOwn ? "4px 0 4px 4px" : "4px 4px 4px 0",
            borderColor: isOwn
              ? `transparent transparent transparent #DCF8C6`
              : `transparent #FFFFFF transparent transparent`,
            right: isOwn ? "-4px" : "auto",
            left: isOwn ? "auto" : "-4px",
          },
        }}
      >
        {/* Group chat sender name */}
        {selectedChat?.isGroupChat && !isOwn && (
          <Typography
            sx={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#444",
            }}
          >
            {msg.sender.name}
          </Typography>
        )}

        {/* Message + Time inline */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            width: "100%",
            gap: 1,
          }}
        >
          <Typography sx={{ wordBreak: "break-word", flex: 1 }}>
            {msg.content}
          </Typography>

          <Typography
            variant="caption"
            sx={{
              opacity: 0.6,
              fontSize: "11px",
              whiteSpace: "nowrap",
            }}
          >
            {time}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

export default MessageBubble;
