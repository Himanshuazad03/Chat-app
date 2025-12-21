import React from "react";
import { Box, Skeleton } from "@mui/material";

function SkeletonChatItem() {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "flex-start",
        padding: "14px",
        borderRadius: "12px",
        background: "#f5f5f5",
        marginBottom: "10px",
      }}
    >
      {/* Avatar */}
      <Skeleton
        variant="circular"
        width={48}
        height={48}
        sx={{ flexShrink: 0 }}
      />

      <Box sx={{ width: "100%" }}>
        {/* Name + Time row */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 0.5,
          }}
        >
          {/* Name */}
          <Skeleton variant="text" width="40%" height={20} />

          {/* Time */}
          <Skeleton variant="text" width={40} height={16} />
        </Box>

        {/* Last message */}
        <Skeleton variant="text" width="60%" height={16} />
      </Box>
    </Box>
  );
}

export default SkeletonChatItem;
