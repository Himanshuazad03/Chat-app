import React from "react";
import CloseIcon from "@mui/icons-material/Close";
import StarsIcon from "@mui/icons-material/Stars";
import { useSelector } from "react-redux";

function BadgeItems({ user, handleFunction, isGroup = false }) {
  const { selectedChat } = useSelector((state) => state.chat);
  return (
    <>
      <div className="bg-[#405fe7] text-white text-sm px-3 py-1 rounded-lg mr-1 mb-1 flex items-center justify-between">
        <div className="flex gap-1 items-center">
          {isGroup && user._id === selectedChat?.groupAdmin?._id && (
            <StarsIcon fontSize="small" />
          )}
          <span>{user.name}</span>
        </div>
        <CloseIcon
          fontSize="small"
          className="ml-2 cursor-pointer"
          onClick={() => {
            handleFunction();
          }}
        />
      </div>
    </>
  );
}

export default BadgeItems;
