import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "https://localhost:5050", {
});

export default socket;
// Socket.io client configuration
