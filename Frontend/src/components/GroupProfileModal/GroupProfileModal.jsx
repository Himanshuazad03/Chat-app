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
import { useState, useMemo, useEffect } from "react";
import { updateChat } from "../../Store/chatSlice";
import debounce from "../Debouncing/Debounce";
import UserListItems from "../Userlist/UserListItems";
import api from "../../api/axios";

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
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState([]);
  const { selectedChat } = useSelector((state) => state.chat);

  const handelSearch = useMemo(
    () =>
      debounce(async (value, controller) => {
        try {
          setLoading(true);
          if (!value.trim()) {
            setLoading(false);
            return;
          }
          const { data } = await api.get(`/api/user?search=${value}`, {
            withCredentials: true,
            signal: controller.signal,
          });
          setLoading(false);
          setSearchResult(data.users);
          
        } catch (error) {
          if (axios.isCancel(error)) {
            console.log("Request canceled", error.message);
          } else {
            console.log(error.message);
          }
        }
      }, 400),
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    if (!userSearch.trim()) {
      setSearchResult([]);
      controller.abort();
      setLoading(false);
      return;
    }

    handelSearch(userSearch, controller);
    return () => controller.abort();
  }, [userSearch]);

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
      const { data } = await api.put("/api/chat/rename", {
        chatId: groupId,
        chatName: updatedGroupName,
      });
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

  const RemoveUser = async (user1) => {
    if (user.id !== selectedChat.groupAdmin._id) {
      setSnack({
        open: true,
        message: "Only Admin can remove User",
        type: "error",
      });
      return;
    }
    
    try {
      const { data } = await axios.put("/api/chat/removeUser", {
        userId: user1._id,
        chatId: selectedChat._id,
      });
      dispatch(updateChat(data));
      setSnack({
        open: true,
        message: "User removed successfully",
        type: "success",
      });
      
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to remove user",
        type: "error",
      });
    }
  };

  const handleAddUser = async (u) => {
    if (selectedChat.users.find((u1) => u1._id === u._id)) {
      setSnack({
        open: true,
        message: "User Already added",
        type: "error",
      });
      return;
    }
    const { data } = await axios.put("/api/chat/addUser", {
      userId: u._id,
      chatId: selectedChat._id,
    });
    dispatch(updateChat(data));
    
  };

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <Box className=" w-full max-w-[300px] md:max-w-[460px] bg-white border shadow-2xl p-6 rounded-xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <Stack>
            <Typography variant="h4" textAlign="center" mb={1}>
              Group Members
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 1 }}>
              {users?.map((u) => (
                <BadgeItems
                  key={u._id}
                  user={u}
                  isGroup={true}
                  handleFunction={() => RemoveUser(u)}
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
              </Box>
              {user.id === selectedChat?.groupAdmin?._id && (
              <>
                <TextField
                  sx={{ mt: 1 }}
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  label="Add User"
                  variant="outlined"
                  size="small"
                  fullWidth
                />
              </>
              )}
            </Box>
            <Box className="max-h-[200px] overflow-y-auto hide-scrollbar scroll-smooth">
              {searchResult?.map((user) => (
                <UserListItems
                  overflowY="scroll"
                  className="cursor-pointer"
                  key={user._id}
                  user={user}
                  handleFunction={() => handleAddUser(user)}
                  clearSearch={() => setUserSearch("")}
                />
              ))}
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
