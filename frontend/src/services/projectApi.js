import api from "./api";

export const getProjects = (params = {}) => api.get("/projects", { params }).then((res) => res.data);
export const getMyProjects = () => api.get("/projects/mine").then((res) => res.data);
export const getProject = (projectId) => api.get(`/projects/${projectId}`).then((res) => res.data);
export const createProject = (payload) => api.post("/projects", payload).then((res) => res.data);
export const applyToProject = (projectId, message, roleAppliedFor = "") => api.post(`/projects/${projectId}/apply`, { message, roleAppliedFor }).then((res) => res.data);
export const getProjectApplications = (projectId) => api.get(`/projects/${projectId}/applications`).then((res) => res.data);
export const reviewProjectApplication = (projectId, applicationId, status) => api.patch(`/projects/${projectId}/applications/${applicationId}`, { status }).then((res) => res.data);
export const updateProject = (projectId, payload) => api.patch(`/projects/${projectId}`, payload).then((res) => res.data);
export const closeProject = (projectId) => api.patch(`/projects/${projectId}/close`).then((res) => res.data);
export const getProjectTeam = (projectId) => api.get(`/projects/${projectId}/team`).then((res) => res.data);
