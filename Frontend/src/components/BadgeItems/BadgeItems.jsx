import React from "react";
import CloseIcon from "@mui/icons-material/Close";

function BadgeItems({ user, handleFunction, setSearch }) {
  return (
    <>
      <div className="bg-[#405fe7] text-white text-sm px-3 py-1 rounded-lg mr-1 mb-1 flex items-center justify-between">
        {user.name}
        <CloseIcon
          fontSize="small"
          className="ml-2 cursor-pointer"
          onClick={() => {
            handleFunction(), setSearch("");
          }}
        />
      </div>
    </>
  );
}

export default BadgeItems;
