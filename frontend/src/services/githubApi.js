import api from "./api";
export const getGithubProfile = (username) => api.get(`/github/${encodeURIComponent(username)}`).then((res) => res.data);
