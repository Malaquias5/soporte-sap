// Helpers de presentación (sin lógica de datos)
export const ESTADOS = ['Abierto', 'En proceso', 'Cerrado'];
const CLASE_ESTADO = { 'Abierto': 'abierto', 'En proceso': 'proceso', 'Cerrado': 'cerrado' };

export const $ = (id) => document.getElementById(id);

// Evita inyectar HTML
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function filaTicket(t, numero) {
  return `
    <tr>
      <td class="num">${numero}</td>
      <td class="num">#${t.id}</td>
      <td><strong>${esc(t.cliente)}</strong></td>
      <td><span class="modulo">${esc(t.modulo_sap)}</span></td>
      <td class="desc">${esc(t.descripcion)}</td>
      <td><span class="prio ${esc(t.prioridad).toLowerCase()}">${esc(t.prioridad)}</span></td>
      <td><span class="tag ${CLASE_ESTADO[t.estado] || ''}">${esc(t.estado)}</span></td>
      <td>
        <div class="acciones">
          <select class="estado" aria-label="Cambiar estado" data-estado-id="${t.id}">
            ${ESTADOS.map((e) => `<option ${e === t.estado ? 'selected' : ''}>${e}</option>`).join('')}
          </select>
          <button class="btn btn-ghost btn-sm" data-editar="${t.id}">Editar</button>
          <button class="btn btn-danger btn-sm" data-eliminar="${t.id}">Eliminar</button>
        </div>
      </td>
    </tr>`;
}

export function mensajeTabla(texto) {
  return `<tr><td colspan="8" class="empty">${texto}</td></tr>`;
}

let timer;
export function toast(texto, tipo = '') {
  const el = $('toast');
  el.textContent = texto;
  el.className = `toast show ${tipo}`;
  clearTimeout(timer);
  timer = setTimeout(() => { el.className = 'toast'; }, 2800);
}
