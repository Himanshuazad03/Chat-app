import {
  Box,
  Button,
  IconButton,
  Tooltip,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileModal from "../ProfileModel/Profile";
import SideDrawer from "../Drawer/Drawer";
import { logout } from "../../Store/authSlice.js";
import { useDispatch } from "react-redux";
import ForumIcon from "@mui/icons-material/Forum";
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LogoutIcon from '@mui/icons-material/Logout';

function Header() {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const open = Boolean(anchorEl);

  // Avatar menu open
  const handleMenuOpen = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // Profile click
  const handleProfileClick = () => {
    setProfileOpen(true);
    handleMenuClose();
  };

  // Logout
  const handleLogout = async () => {
    handleMenuClose();
    dispatch(logout());
    await axios.get("/api/user/logout", { withCredentials: true });
    navigate("/");
  };

  return (
    <>
      {/* Slim Sidebar */}
      <Box
        sx={{
          width: "70px",
          height: "100vh",
          bgcolor: "#2f4760",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          py: 2,
        }}
      >
        {/* TOP SECTION */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 3.1,
          }}
        >
          {/* Search Button */}
          <Tooltip title="Search Users">
            <Box
              display={"flex"}
              justifyContent={"center"}
              alignItems={"center"}
            >
              <IconButton
                onClick={() => setOpenDrawer(true)}
                sx={{
                  borderRadius: "50%",
                  padding: "10px",
                  transition: "0.2s ease",
                  "&:hover": {
                    bgcolor: "rgba(255, 255, 255, 0.25)",
                  },
                }}
              >
                <SearchIcon sx={{ color: "white", width: 26, height: 26 }} />
              </IconButton>
            </Box>
          </Tooltip>

          {/* Chats Button (selected) */}
          <Tooltip title="All Chats">
            <Box
              sx={{
                bgcolor: "#d6d9db",
                padding: "11.3px 4px",
                width: "100%",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <ForumIcon sx={{ width: 34, height: 34, color: "#3d82f0" }} />
              <p
                className="text-[10px] text-gray-600 font-semibold mt-1"
                style={{ userSelect: "none" }}
              >
                All Chats
              </p>
            </Box>
          </Tooltip>
        </Box>

        {/* BOTTOM SECTION - Avatar */}
        <Box>
          <Tooltip title="Account">
            <IconButton onClick={handleMenuOpen}>
              <Avatar
                src={user?.image}
                sx={{
                  width: 42,
                  height: 42,
                  border: "2px solid rgba(255,255,255,0.7)",
                }}
              />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Drawer Search */}
      <SideDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />

      {/* Avatar Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 150 },
        }}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <MenuItem onClick={handleProfileClick}>
          <AccountCircleIcon sx={{ mr: 1, color: "gray" }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: "error.main" }}>
          <LogoutIcon sx={{ mr: 1, color: "error.main" }} />
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Modal */}
      <ProfileModal
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}

export default Header;
