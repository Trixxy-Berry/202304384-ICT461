const API_BASE = "http://localhost:3000";

export async function request(path, options = {}) {
  const res = await fetch(API_BASE + path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (res.status === 204) return { ok: res.ok, status: res.status, data: null };
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON */ }
  return { ok: res.ok, status: res.status, data };
}

export const getCourses    = ()      => request("/api/courses");
export const createReg     = (body)  => request("/api/registrations", { method: "POST", body: JSON.stringify(body) });
export const getReg        = (id)    => request(`/api/registrations/${id}`);
export const putReg        = (id, b) => request(`/api/registrations/${id}`, { method: "PUT", body: JSON.stringify(b) });
export const patchReg      = (id, b) => request(`/api/registrations/${id}`, { method: "PATCH", body: JSON.stringify(b) });
export const deleteReg     = (id)    => request(`/api/registrations/${id}`, { method: "DELETE" });