import React, { useState } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import { useSelector, useDispatch } from "react-redux";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import { setSelectedChat } from "../../Store/chatSlice";
import ProfileModal from "../ProfileModel/Profile";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import GroupProfileModal from "../GroupProfileModal/GroupProfileModal";
import SnakeMessage from "../SnakeMessage/SnakeMessage";
import axios from "axios";
import { removeChat } from "../../Store/chatSlice";

function SingleChat() {
  const [snack, setSnack] = useState({
    open: false,
    message: "",
    type: "success",
  });
  const { selectedChat } = useSelector((state) => state.chat);
  const { user } = useSelector((state) => state.auth);
  const [profileOpen, setProfileOpen] = useState(false);
  const [groupProfileOpen, setGroupProfileOpen] = useState(false);
  const dispatch = useDispatch();
  const LeaveGroup = async (chatId) => {
    // Logic to leave the group chat
    try {
      const { data } = await axios.put(
        "/api/chat/leave",
        { chatId },
        { withCredentials: true }
      );
      console.log(data);

      dispatch(removeChat(selectedChat._id));
      dispatch(setSelectedChat(null));

      setSnack({
        open: true,
        message: "You left the group",
        type: "success",
      });
    } catch (error) {
      setSnack({
        open: true,
        message: "Failed to leave the group",
        type: "error",
      });
    }
    dispatch(setSelectedChat(null));
  };

  const getSender = (loggedUser, users) => {
    return users[0]._id === loggedUser.id ? users[1].name : users[0].name;
  };
  return (
    <>
      {selectedChat ? (
        <>
          <Box
            pb={2}
            px={2}
            fontSize={{ xs: "22px", md: "24px" }}
            display={"flex"}
            fontFamily={"sans-serif"}
            width={"100%"}
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <IconButton
              sx={{ display: { md: "none" } }}
              onClick={() => {
                dispatch(setSelectedChat(null));
                // Dispatch action to deselect chat
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              fontSize={{ xs: "24px", md: "30px" }}
              fontFamily={"sans-serif"}
            >
              {!selectedChat.isGroupChat
                ? getSender(user, selectedChat.users)
                : selectedChat.chatName}
            </Typography>
            <Box display={"flex"} gap={2}>
              <Button
                onClick={() => {
                  if (selectedChat.isGroupChat) {
                    setGroupProfileOpen(true);
                  } else {
                    setProfileOpen(true);
                  }
                }}
                variant="contained"
                size="small"
                sx={{
                  "& .MuiButton-startIcon": { marginRight: "0px" },
                  padding: "6px",
                }}
              >
                {selectedChat.isGroupChat ? (
                  <PeopleAltIcon margin="none" />
                ) : (
                  <AccountBoxIcon margin="none" />
                )}
              </Button>
              {selectedChat.isGroupChat && (
                <Button
                  variant="contained"
                  color="error"
                  onClick={() => LeaveGroup(selectedChat._id)}
                >
                  Leave
                </Button>
              )}
            </Box>
          </Box>
          <Box
            display={"flex"}
            flexDirection={"column"}
            height={"100%"}
            width={"100%"}
            justifyContent={"flex-end"}
            p={3}
            bgcolor={"#E8E8E8"}
            borderRadius={"20px"}
            overflowY={"hidden"}
          ></Box>
        </>
      ) : (
        <Box
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
          height={"100%"}
        >
          <Typography
            fontSize={"30px"}
            pb={3}
            fontFamily={"sans-serif"}
            color={"gray"}
          >
            Click on a user to start chatting
          </Typography>
        </Box>
      )}
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        user={
          selectedChat
            ? selectedChat.users.find((u) => u._id !== user.id)
            : null
        }
      />
      <GroupProfileModal
        open={groupProfileOpen}
        onClose={() => setGroupProfileOpen(false)}
        users={selectedChat?.users}
      />
      <SnakeMessage
        open={snack.open}
        message={snack.message}
        type={snack.type}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
      />
    </>
  );
}

export default SingleChat;
