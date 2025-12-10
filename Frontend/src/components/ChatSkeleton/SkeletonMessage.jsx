import React from "react";
import { Box, Skeleton, Stack } from "@mui/material";

function SkeletonMessage({ isOwn }) {
  return (
    <Stack
      direction="row"
      justifyContent={isOwn ? "flex-end" : "flex-start"}
      sx={{ mb: 1.5 }}
    >
      <Box
        sx={{
          maxWidth: "70%",
          bgcolor: "transparent",
        }}
      >
        {/* Bubble Skeleton */}
        <Skeleton
          variant="rounded"
          width={140}
          height={40}
          sx={{ borderRadius: 2 }}
        />

        {/* Small timestamp bar */}
    
      </Box>
    </Stack>
  );
}

export default SkeletonMessage;
