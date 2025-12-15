import React from "react";
import { Box, Typography, Avatar } from "@mui/material";
import { useSelector } from "react-redux";
import DoneIcon from "@mui/icons-material/Done";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CircularProgress from "@mui/material/CircularProgress";

function MessageBubble({ msg, isOwn, onMediaClick }) {
  const { selectedChat } = useSelector((state) => state.chat);
  const time = new Date(msg.createdAt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Box
      display="flex"
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      mt={1.5}
      gap={1}
    >
      {/* Avatar only for group chat & other users */}
      {!isOwn && selectedChat.isGroupChat && (
        <Avatar
          sx={{ width: 32, height: 32 }}
          src={msg.sender.image}
          alt={msg.sender.name}
        />
      )}

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
        {/* Group sender name */}
        {!isOwn && selectedChat?.isGroupChat && (
          <Typography
            sx={{ fontSize: "12px", fontWeight: 600, color: "#444", mb: 0.3 }}
          >
            {msg.sender.name}
          </Typography>
        )}

        {msg.isImage && (
          <Box
            sx={{
              position: "relative",
              paddingBottom: msg.isUploading ? "8px" : 0,
            }}
          >
            <img
              src={msg.mediaUrl}
              alt="photo"
              onClick={() => onMediaClick(msg.mediaUrl)}
              style={{
                width: "100%",
                maxWidth: 260,
                borderRadius: 8,
                opacity: msg.isUploading ? 0.7 : 1,
              }}
            />

            {/* Progress bar */}
            {msg.isUploading && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  background: "rgba(0,0,0,0.35)",
                  borderRadius: "50%",
                  p: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <CircularProgress
                  variant="determinate"
                  value={msg.uploadProgress}
                  size={36}
                  thickness={4}
                  sx={{
                    color: "#4caf50",
                  }}
                />
                <Typography
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "10px",
                    color: "#fff",
                  }}
                >
                  {msg.uploadProgress}%
                </Typography>
              </Box>
            )}

            {/* Time + ticks */}
            <Box
              sx={{
                position: "absolute",
                bottom: msg.isUploading ? 10 : 4,
                right: 6,
                display: "flex",
                alignItems: "center",
                gap: 0.3,
                background: "rgba(0,0,0,0.35)",
                borderRadius: 1,
                px: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#fff", fontSize: "10px" }}
              >
                {time}
              </Typography>
              {isOwn && <StatusTick status={msg.status} />}
            </Box>
          </Box>
        )}

        {/* VIDEO */}
        {msg.isVideo && (
          <>
            <video
              src={msg.mediaUrl}
              controls
              onClick={() => onMediaClick(msg.mediaUrl)}
              style={{
                width: "100%",
                maxWidth: "260px",
                borderRadius: "8px",
              }}
            />

            {/* Time + ticks */}

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                gap: 0.3,
                mt: 0.3,
              }}
            >
              <Typography
                variant="caption"
                sx={{ opacity: 0.7, fontSize: "11px" }}
              >
                {time}
              </Typography>
              {isOwn && <StatusTick status={msg.status} />}
            </Box>
          </>
        )}

        {/* --------------------- */}
        {/* TEXT MESSAGE STYLE   */}
        {/* --------------------- */}
        {!msg.isImage && !msg.isVideo && (
          <Box sx={{ display: "flex", alignItems: "flex-end", gap: 0.7 }}>
            <Typography sx={{ fontSize: "15px" }}>{msg.content}</Typography>

            {/* Inline time */}
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

            {/* Inline ticks */}
            {isOwn && <StatusTick status={msg.status} />}
          </Box>
        )}
      </Box>
    </Box>
  );
}

/* Small helper component for ticks */
function StatusTick({ status }) {
  if (status === "sent")
    return <DoneIcon sx={{ fontSize: 15, color: "gray" }} />;

  if (status === "delivered")
    return <DoneAllIcon sx={{ fontSize: 16, color: "gray" }} />;

  if (status === "seen")
    return <DoneAllIcon sx={{ fontSize: 16, color: "#4FC3F7" }} />;

  return null;
}

export default MessageBubble;
