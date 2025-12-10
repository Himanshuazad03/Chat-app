import React from "react";
import { Box, Typography } from "@mui/material";

function MessageDate({ date }) {
  return (
    <Box display="flex" justifyContent="center" my={2}>
      <Box
        sx={{
          bgcolor: "#E0E0E0",
          px: 2,
          py: 0.5,
          borderRadius: 2,
          fontSize: "14px",
          position: "sticky"
        }}
      >
        {date}
      </Box>
    </Box>
  );
}

export default MessageDate;
