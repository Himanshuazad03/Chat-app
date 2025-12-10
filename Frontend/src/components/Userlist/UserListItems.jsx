import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box
} from "@mui/material";

function UserListItems({ user, handleFunction, clearSearch }) {
  return (
    <ListItem disablePadding key={user._id}>
      <ListItemButton
        sx={{
          display: "flex",
          bgcolor: "#e8eefe",
          mb: 1.5,
          borderRadius: "12px",
          transition: "0.2s",
          "&:hover": {
            bgcolor: "#dce6fc",
            transform: "scale(1.02)",
            boxShadow: "0 3px 10px rgba(0,0,0,0.08)",
          },
        }}
        onClick={() => {
          handleFunction(),
          clearSearch()
          
        }}
      >
        <ListItemAvatar>
          <Avatar src={user.image} />
        </ListItemAvatar>
        <Box display={"flex"} flexDirection={"column"}>
          <span className="font-semibold">{user.name}</span>
          <span className="text-sm text-gray-600">{user.email}</span>
        </Box>
      </ListItemButton>
    </ListItem>
  );
}

export default UserListItems;
