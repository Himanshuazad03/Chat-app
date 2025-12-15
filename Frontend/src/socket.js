import { io } from "socket.io-client";

const SOCKET_URL =
  import.meta.env.VITE_API_URL || "https://chat-app-4n2g.onrender.com";

const socket = io(SOCKET_URL, {
  withCredentials: true,
  autoConnect: false, // IMPORTANT
});

export default socket;
