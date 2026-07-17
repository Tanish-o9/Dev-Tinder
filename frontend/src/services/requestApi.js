import api from "./api";

export const sendInterested = async (userId) => {
  const res = await api.post(`/request/send/interested/${userId}`);
  return res.data;
};

export const sendIgnored = async (userId) => {
  const res = await api.post(`/request/send/ignored/${userId}`);
  return res.data;
};

export const reviewRequest = async (status, requestId) => {
  const res = await api.post(`/request/review/${status}/${requestId}`);
  return res.data;
};