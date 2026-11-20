// Cliente HTTP de la API de tickets
async function request(url, method = 'GET', body) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body && JSON.stringify(body),
  });
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Error');
  return res.status === 204 ? null : res.json();
}

const BASE = '/api/tickets';

export const ticketsApi = {
  listar: ({ page, limit, estado }) =>
    request(`${BASE}?page=${page}&limit=${limit}&estado=${encodeURIComponent(estado)}`),
  resumen: () => request(`${BASE}/resumen`),
  crear: (datos) => request(BASE, 'POST', datos),
  actualizar: (id, datos) => request(`${BASE}/${id}`, 'PUT', datos),
  eliminar: (id) => request(`${BASE}/${id}`, 'DELETE'),
};
