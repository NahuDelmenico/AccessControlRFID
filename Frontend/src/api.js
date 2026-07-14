// Cliente HTTP para la API de Django.
// Si el back corre en otra máquina/puerto, definir VITE_API_URL en un .env.local
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const detalle = data ? JSON.stringify(data) : `Error ${res.status}`;
    throw new Error(detalle);
  }

  return data;
}

export const api = {
  // Empleados / fichas
  getEmployees: () => request("/employees/"),
  createEmployee: (payload) =>
    request("/employees/", { method: "POST", body: JSON.stringify(payload) }),
  updateEmployee: (id, payload) =>
    request(`/employees/${id}/`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteEmployee: (id) =>
    request(`/employees/${id}/`, { method: "DELETE" }),

  // Registros de acceso
  getAccessLogs: () => request("/access-logs/"),
  createAccessLog: (payload) =>
    request("/access-logs/", { method: "POST", body: JSON.stringify(payload) }),
};
