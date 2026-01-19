import axios from "./api";

// Save message to backend
export const saveMessageApi = (payload) => axios.post("/chat/message", payload);

// Get message history
export const getChatHistoryApi = (jobId) => axios.get(`/chat/${jobId}`);
// Chat functionality API endpoints
