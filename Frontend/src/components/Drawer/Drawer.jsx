import React from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  TextField,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useMemo } from "react";
import axios from "axios";
import UserListItems from "../Userlist/UserListItems";
import { useSelector, useDispatch } from "react-redux";
import { setSelectedChat, setChats, addChat } from "../../Store/chatSlice.js";
import debounce from "../Debouncing/Debounce.js";

function SideDrawer({ open, onClose }) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [AllUsers, setAllUsers] = React.useState([]);
  const [loadingChat, setLoadingChat] = React.useState(false);
  const { chats } = useSelector((state) => state.chat);


  const dispatch = useDispatch();

  const debouncedSearch = useMemo(
    () =>
      debounce(async (value, controller) => {
        try {
          const res = await axios.get(`/api/user?search=${value}`, {
            withCredentials: true,
            signal: controller.signal,
          });
          setAllUsers(res.data.users);
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
    if (!searchTerm.trim()) {
      setAllUsers([]);
      return;
    }

    const controller = new AbortController();
    debouncedSearch(searchTerm, controller);
    return () => controller.abort();
  }, [searchTerm]);

  const accessChat = async (userId) => {
    try {
      setLoadingChat(true);
      const { data } = await axios.post("/api/chat", { userId });
      dispatch(addChat(data));
      dispatch(setSelectedChat(data));
      setLoadingChat(false);
      onClose();
      
    } catch (error) {
      console.error("Error accessing/creating chat:", error);
    }
  };

  return (
    <>
      <Drawer anchor="left" open={open} onClose={onClose}>
        <Box width={340} p={3} gap={4}>
          {/* Header */}
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6">Search</Typography>
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>

          {/* Search Input */}
          <TextField
            fullWidth
            placeholder="Search users..."
            sx={{ mt: 3 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {/* Search Results */}
          {AllUsers.length > 0 ? (
          <Box mt={2}>
            {AllUsers.map((user) => (
              <UserListItems
                key={user._id}
                user={user}
                onClose={onClose}
                handleFunction={() => accessChat(user._id)}
              />
            ))}
          </Box>
          ) : (
            <Typography mt={2} color="textSecondary">
              No users found.
            </Typography>
          )}
        </Box>
      </Drawer>
    </>
  );
}

export default SideDrawer;
