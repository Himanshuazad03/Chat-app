import { createSlice } from "@reduxjs/toolkit";

const savedNotifications =
  JSON.parse(localStorage.getItem("notifications")) || [];

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedChat: null,
    chats: [],
    notifications: savedNotifications,
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

      // Find existing chat
      const existing = state.chats.find((c) => c._id === updated._id);

      if (!updated.users && existing) return;

      // Merge latestMessage safely
      const mergedChat = {
        ...existing,
        ...updated,
        latestMessage: updated.latestMessage ?? existing?.latestMessage,
      };

      // Remove old entry
      state.chats = state.chats.filter((c) => c._id !== updated._id);

      // Insert at top
      state.chats.unshift(mergedChat);

      // Update selectedChat safely
      if (state.selectedChat?._id === updated._id) {
        state.selectedChat = mergedChat;
      }
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
        localStorage.setItem(
          "notifications",
          JSON.stringify(state.notifications)
        );
      } else {
        state.notifications.unshift(newNotif); // allow multiple notifications
      }
    },

    clearNotifications: (state, action) => {
      const chatId = action.payload;
      state.notifications = state.notifications.filter(
        (n) => n.chat?._id !== chatId
      );
      localStorage.setItem(
        "notifications",
        JSON.stringify(state.notifications)
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
