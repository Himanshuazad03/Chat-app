import React from "react";
import { Modal, Box, Stack, Typography, Avatar } from "@mui/material";

function ProfileModal({ user, open, onClose }) {
  return (
    <Modal open={open} onClose={onClose}>
      <Box
        className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
          w-[440px] bg-white border border-black shadow-2xl p-6 rounded-xl
        "
      >
        <Stack spacing={3} alignItems="center">
          <Avatar
            src={user?.image}
            alt={user?.name}
            sx={{ width: 110, height: 110 }}
          />

          <Typography variant="h4" textAlign="center">
            {user?.name}
          </Typography>

          <Typography variant="h6" color="gray" textAlign="center">
            {user?.email}
          </Typography>
        </Stack>
      </Box>
    </Modal>
  );
}

export default ProfileModal;
