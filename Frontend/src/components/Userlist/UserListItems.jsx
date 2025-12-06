import React from 'react'
import { ListItem, ListItemButton, ListItemAvatar, Avatar, ListItemText } from '@mui/material';

function UserListItems({ user, handleFunction, onClose }) {

  return (
    <ListItem disablePadding key={user._id}>
                <ListItemButton
                  sx={{
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
                      handleFunction();
                    }}
                >
                  <ListItemAvatar>
                    <Avatar src={user.image} />
                  </ListItemAvatar>
                  <ListItemText primary={user.name} />
                </ListItemButton>
              </ListItem>
  )
}

export default UserListItems