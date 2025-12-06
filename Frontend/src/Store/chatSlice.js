import { createSlice } from "@reduxjs/toolkit";

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    selectedChat: null,
    chats: [],
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
  },
});
export const { setSelectedChat, setChats, addChat, updateChat, removeChat } =
  chatSlice.actions;
export default chatSlice.reducer;
