import React from "react";
import { Box, Typography } from "@mui/material";

function SystemMessage({ msg }) {
  if (msg.isSystemMessage) {
    return (
      <Box display="flex" justifyContent="center" my={1}>
        <Typography
          sx={{
            background: "#e9e9e9",
            color: "#555",
            padding: "5px 12px",
            borderRadius: "20px",
            fontSize: "13px",
            textAlign: "center",
            maxWidth: "80%",
          }}
        >
          {msg.content}
        </Typography>
      </Box>
    );
  }
  return null;
}

export default SystemMessage;
