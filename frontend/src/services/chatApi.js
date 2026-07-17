import api from "./api";

export const getConversations = () => api.get("/chat/conversations").then((r) => r.data);
export const getMessages = (userId) => api.get(`/chat/${userId}/messages`).then((r) => r.data);
