import { createSlice } from "@reduxjs/toolkit";

const userInfo = JSON.parse(localStorage.getItem("user"));
const tokenInfo = localStorage.getItem("token");

const initialState = {
  user: userInfo || null,
  token: tokenInfo || null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      // persist to localStorage
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
    },

    logout: (state) => {
      state.user = null;
      state.token = null;

      // clear localStorage
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    },

  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
