import React from "react";
import {
  Modal,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
} from "@mui/material";
import BadgeItems from "../BadgeItems/BadgeItems";
import { useSelector, useDispatch } from "react-redux";
import SnakeMessage from "../SnakeMessage/SnakeMessage";
import { useState } from "react";
import axios from "axios";
import { updateChat } from "../../Store/chatSlice";

function GroupProfileModal({ open, onClose, users }) {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const [updatedGroupName, setUpdatedGroupName] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const { selectedChat } = useSelector((state) => state.chat);


  const handelUpdateGroup = async (groupId) => {
    if (!updatedGroupName) {
      setSnack({
        open: true,
        message: "Enter Group name",
        type: "error",
      });
      return;
    }
    try {
      // API call to update group name
      const { data } = await axios.put("/api/chat/rename", {
        chatId: groupId,
        chatName: updatedGroupName,
      });
      console.log(data);
      dispatch(updateChat(data));
      setUpdatedGroupName("");
      onClose();
      // Handle success response
      setSnack({
        open: true,
        message: "Group name updated successfully",
        type: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to update group name",
        type: "error",
      });
    }
  };
  const RemoveUser = (userToRemove) => {
    console.log("Remove user:", userToRemove);
  };
  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box
          className="
          absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            w-[440px] bg-white border shadow-2xl p-6 rounded-xl"
        >
          <Stack spacing={3} alignItems="center">
            <Typography variant="h4" textAlign="center">
              Group Members
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {users?.map((user) => (
                <BadgeItems
                  key={user._id}
                  user={user}
                  handleFunction={() => RemoveUser(user)}
                />
              ))}
              <Box
                sx={{
                  width: "100%",
                  display: "flex",
                  gap: 1,
                  justifyContent: "space-between",
                  mt: 1,
                }}
              >
                {user.id === selectedChat?.groupAdmin?._id && (
                  <>
                    <TextField
                      label="Group Name"
                      value={updatedGroupName}
                      onChange={(e) => setUpdatedGroupName(e.target.value)}
                      variant="outlined"
                      size="small"
                      fullWidth
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() => handelUpdateGroup(selectedChat._id)}
                    >
                      Update
                    </Button>
                  </>
                )}
              </Box>
              <TextField
                sx={{ mt: 1 }}
                label="Add User"
                variant="outlined"
                size="small"
                fullWidth
              />
            </Box>
          </Stack>
        </Box>
      </Modal>
      <SnakeMessage
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
}

export default GroupProfileModal;
