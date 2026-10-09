import api from "./api";

export async function fetchEmployees(params) {
  const { data } = await api.get("/employees", { params });
  return data; // { success, data: items, pagination }
}

export async function fetchEmployee(id) {
  const { data } = await api.get(`/employees/${id}`);
  return data.data;
}

export async function createEmployee(payload) {
  const { data } = await api.post("/employees", payload);
  return data.data;
}

export async function updateEmployee(id, payload) {
  const { data } = await api.put(`/employees/${id}`, payload);
  return data.data;
}

export async function deleteEmployee(id) {
  await api.delete(`/employees/${id}`);
}
