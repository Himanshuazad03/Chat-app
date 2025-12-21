import React from "react";
import SkeletonChatItem from "./chatSkeletonItem";

function SkeletonChatList() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, index) => (
        <SkeletonChatItem key={index} />
      ))}
    </>
  );
}

export default SkeletonChatList;
