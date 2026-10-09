import api from "./api";

export async function fetchSummary() {
  const { data } = await api.get("/stats/summary");
  return data.data;
}
