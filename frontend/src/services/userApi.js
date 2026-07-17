import api from "./api";

export const getFeed = async (page = 1, limit = 20, filters = {}) => {
  const res = await api.get("/feed", { params: { page, limit, ...filters } });
  return res.data;
};

export const searchDevelopers = async (q, page = 1, limit = 20) => {
  const res = await api.get("/developers/search", { params: { q, page, limit } });
  return res.data;
};

export const getDeveloperCompatibility = async (userId) => {
  const res = await api.get(`/developers/${userId}/compatibility`);
  return res.data;
};

export const getSkillTaxonomy = async () => {
  const res = await api.get("/profile/skills");
  return res.data;
};

export const getCollaborationReadiness = async () => {
  const res = await api.get("/profile/readiness");
  return res.data;
};

export const getConnections = async () => {
  const res = await api.get("/user/connections");
  return res.data;
};

export const getReceivedRequests = async () => {
  const res = await api.get("/user/requests/received");
  return res.data;
};

export const updateProfile = async (profileData) => {
  const res = await api.patch("/profile/edit", profileData);
  return res.data;
};

export const getConnectionProfile = async (userId) => {
  const res = await api.get(`/user/profile/${userId}`);
  return res.data;
};

export const getSavedDevelopers = async () => (await api.get("/developers/saved")).data;
export const saveDeveloper = async (userId) => (await api.post(`/developers/${userId}/save`)).data;
export const removeSavedDeveloper = async (userId) => (await api.delete(`/developers/${userId}/save`)).data;

export const blockUser = async (userId) => (await api.post(`/developers/${userId}/block`)).data;
export const unblockUser = async (userId) => (await api.delete(`/developers/${userId}/block`)).data;
export const getBlockedUsers = async () => (await api.get("/developers/blocked")).data;

export const reportUser = async (userId, reason, description = "") =>
  (await api.post(`/developers/${userId}/report`, { reason, description })).data;
