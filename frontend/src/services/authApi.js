import api from "./api";

export const login = async (emailId, password) => {
  const res = await api.post("/login", { emailId, password });
  return res.data;
};

export const signup = async (userData) => {
  const res = await api.post("/signup", userData);
  return res.data;
};

export const logout = async () => {
  const res = await api.post("/logout");
  return res.data;
};

export const getCurrentUser = async () => {
  const res = await api.get("/profile/view");
  return res.data;
};