import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

function SkeletonMessage({ isOwn }) {
  const bubbleWidth = Math.floor(Math.random() * 120) + 130; // 130–250px

  return (
    <Stack
      direction="row"
      spacing={1}
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      alignItems="flex-start"
      sx={{ my: 1.5, px: 1.5 }}
    >
      {/* Incoming message → show avatar */}
      {!isOwn && (
        <Skeleton
          variant="circular"
          width={35}
          height={35}
          sx={{ flexShrink: 0 }}
        />
      )}

      <Box
        sx={{
          maxWidth: "75%",
          display: "flex",
          flexDirection: "column",
          alignItems: isOwn ? "flex-end" : "flex-start",
        }}
      >
        {/* Sender name only for incoming group messages */}
        {!isOwn && (
          <Skeleton
            variant="rounded"
            height={12}
            width={90}
            sx={{ borderRadius: 1, mb: 0.7 }}
          />
        )}

        {/* Bubble */}
        <Skeleton
          variant="rounded"
          width={bubbleWidth}
          height={42}
          sx={{
            borderRadius: isOwn
              ? "10px 0px 10px 10px" // right bubble
              : "0px 10px 10px 10px", // left bubble
          }}
        />

        {/* Timestamp */}
        <Skeleton
          variant="rounded"
          height={10}
          width={45}
          sx={{ borderRadius: 1, mt: 0.7, opacity: 0.6 }}
        />
      </Box>
    </Stack>
  );
}

export default SkeletonMessage;
