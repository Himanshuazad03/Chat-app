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

function Header() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const dispatch = useDispatch();

  const open = Boolean(anchorEl);
  const { user } = useSelector((state) => state.auth);

  const navigate = useNavigate();

  // open avatar menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // close avatar menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // open profile modal
  const handleProfileClick = () => {
    setProfileOpen(true);  // open modal
    handleMenuClose();     // close menu
  };

  // logout
  const handleLogout = async () => {
    handleMenuClose();
    dispatch(logout());
    await axios.get("/api/user/logout", { withCredentials: true });

    navigate("/");
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bgcolor="white"
        width="100%"
        padding="8px 14px"
        border="1.5px solid #e5e7eb"
        boxShadow="0 1px 3px rgba(0,0,0,0.08)"
      >
        {/* Search Button */}
        <Tooltip title="Search Users">
          <Button
            variant="text"
            sx={{
              color: "black",
              textTransform: "none",
              padding: "6px 10px",
              borderRadius: "8px",
              "&:hover": {
                backgroundColor: "#f3f4f6",
              },
              gap: "6px",
            }}
            onClick={() => setOpenDrawer(true)}
          >
            <SearchIcon fontSize="small" />
            <span className="cursor-pointer text-base hidden md:inline">
              Search
            </span>
          </Button>
        </Tooltip>
        <SideDrawer open={openDrawer} onClose={() => setOpenDrawer(false)} />

        {/* Avatar */}
        <Tooltip title="Account settings">
          <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
            <Avatar
              src={user?.image}
              alt="User"
              sx={{
                width: 36,
                height: 36,
                cursor: "pointer",
                border: "1px solid black",
              }}
            />
          </IconButton>
        </Tooltip>

        {/* Menu */}
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{
            elevation: 2,
            sx: { minWidth: 140 },
          }}
        >
          <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
          <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
      </Box>

      {/* Profile Modal Lives OUTSIDE Menu */}
      <ProfileModal
        user={user}
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
      />
    </>
  );
}

export default Header;
