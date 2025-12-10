import { createSlice } from "@reduxjs/toolkit";
import { set } from "mongoose";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedChat: null,
    chats: [],
    notifications: [],
  },
  reducers: {
    setSelectedChat: (state, action) => {
      state.selectedChat = action.payload;
    },

    addChat: (state, action) => {
      const newChat = action.payload;
      const exists = state.chats.some((c) => c._id === newChat._id);

      if (!exists) {
        state.chats.unshift(newChat); // Add to beginning
      }
    },

    setChats: (state, action) => {
      state.chats = action.payload;
    },

    updateChat: (state, action) => {
      const updated = action.payload;

      // update selectedChat
      if (state.selectedChat?._id === updated._id) {
        state.selectedChat = updated;
      }

      // update chats list
      state.chats = state.chats.map((c) =>
        c._id === updated._id ? updated : c
      );
    },

    removeChat: (state, action) => {
      const id = action.payload;
      state.chats = state.chats.filter((c) => c._id !== id);

      if (state.selectedChat?._id === id) {
        state.selectedChat = null;
      }
    },

    setNotification: (state, action) => {
      const newNotif = action.payload;

      // find notifications for this chat
      const exists = state.notifications.some(
        (n) => n.chat?._id === newNotif.chat?._id
      );

      // if first notification for this chat, add it
      if (!exists) {
        state.notifications.unshift(newNotif);
      } else {
        state.notifications.unshift(newNotif); // allow multiple notifications
      }
    },

    clearNotifications: (state, action) => {
      const chatId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.chat?._id !== chatId
      );
    },
  },
});
export const {
  setSelectedChat,
  setChats,
  addChat,
  updateChat,
  removeChat,
  setNotification,
  clearNotifications,
} = chatSlice.actions;
export default chatSlice.reducer;
