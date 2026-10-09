import api from "./api";

export async function fetchLeaves(params) {
  const { data } = await api.get("/leaves", { params });
  return data; // { success, data: items, pagination }
}

export async function fetchLeave(id) {
  const { data } = await api.get(`/leaves/${id}`);
  return data.data;
}

export async function createLeave(payload) {
  const { data } = await api.post("/leaves", payload);
  return data.data;
}

export async function updateLeaveStatus(id, payload) {
  const { data } = await api.patch(`/leaves/${id}/status`, payload);
  return data.data;
}
