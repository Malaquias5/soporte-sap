// Controlador de la página: estado + eventos
import { ticketsApi } from './api.js';
import { $, filaTicket, mensajeTabla, toast } from './ui.js';

const LIMITE = 5;
const estado = { tickets: [], editandoId: null, pagina: 1, totalPaginas: 1, filtro: '' };

// ---- Datos ----
async function cargar() {
  const datos = await ticketsApi.listar({ page: estado.pagina, limit: LIMITE, estado: estado.filtro });
  estado.totalPaginas = Math.max(Math.ceil(datos.total / LIMITE), 1);
  // Si la página quedó vacía (p. ej. tras eliminar), retroceder
  if (estado.pagina > estado.totalPaginas) { estado.pagina = estado.totalPaginas; return cargar(); }
  estado.tickets = datos.tickets;
  pintarTabla(datos.total);
}

async function cargarResumen() {
  const { total, porEstado } = await ticketsApi.resumen();
  $('kpi-total').textContent = total;
  $('kpi-abierto').textContent = porEstado['Abierto'];
  $('kpi-proceso').textContent = porEstado['En proceso'];
  $('kpi-cerrado').textContent = porEstado['Cerrado'];
}

function refrescar() {
  return Promise.all([cargar(), cargarResumen()]).catch(() => {
    $('lista').innerHTML = mensajeTabla('No se pudo conectar con el servidor.');
  });
}

// ---- Render ----
function pintarTabla(total) {
  const { pagina, totalPaginas, tickets } = estado;
  $('pagina').textContent = `Página ${pagina} de ${totalPaginas}`;
  $('anterior').disabled = pagina <= 1;
  $('siguiente').disabled = pagina >= totalPaginas;
  const desde = total ? (pagina - 1) * LIMITE + 1 : 0;
  $('resumen-pag').textContent = `Mostrando ${desde}–${(pagina - 1) * LIMITE + tickets.length} de ${total}`;
  $('lista').innerHTML = tickets.length
    ? tickets.map((t, i) => filaTicket(t, (pagina - 1) * LIMITE + i + 1)).join('')
    : mensajeTabla('No hay tickets.');
}

// ---- Modal ----
function abrirModal(ticket) {
  estado.editandoId = ticket ? ticket.id : null;
  $('form').reset();
  if (ticket) {
    $('cliente').value = ticket.cliente;
    $('modulo_sap').value = ticket.modulo_sap;
    $('descripcion').value = ticket.descripcion;
    $('prioridad').value = ticket.prioridad;
  }
  $('titulo').textContent = ticket ? `Editar ticket #${ticket.id}` : 'Nuevo ticket';
  $('guardar').textContent = ticket ? 'Guardar cambios' : 'Crear ticket';
  $('modal').showModal();
  $('cliente').focus();
}

function cerrarModal() {
  estado.editandoId = null;
  $('modal').close();
}

// ---- Acciones ----
async function guardar(e) {
  e.preventDefault();
  const datos = {
    cliente: $('cliente').value,
    modulo_sap: $('modulo_sap').value,
    descripcion: $('descripcion').value,
    prioridad: $('prioridad').value,
  };
  try {
    if (estado.editandoId) await ticketsApi.actualizar(estado.editandoId, datos);
    else await ticketsApi.crear(datos);
    toast(estado.editandoId ? 'Ticket actualizado' : 'Ticket creado');
    cerrarModal();
    refrescar();
  } catch (err) { toast(err.message, 'error'); }
}

async function cambiarEstado(id, nuevo) {
  try {
    await ticketsApi.actualizar(id, { estado: nuevo });
    toast(`Ticket #${id} → ${nuevo}`);
  } catch (err) { toast(err.message, 'error'); }
  refrescar();
}

async function eliminar(id) {
  if (!confirm(`¿Eliminar el ticket #${id}?`)) return;
  try {
    await ticketsApi.eliminar(id);
    toast(`Ticket #${id} eliminado`);
  } catch (err) { toast(err.message, 'error'); }
  refrescar();
}

// ---- Eventos ----
document.querySelectorAll('[data-accion="nuevo"]').forEach((b) => b.addEventListener('click', () => abrirModal()));
$('form').addEventListener('submit', guardar);
$('cancelar').addEventListener('click', cerrarModal);
$('cerrar').addEventListener('click', cerrarModal);
$('modal').addEventListener('close', () => { estado.editandoId = null; });

$('anterior').addEventListener('click', () => { estado.pagina--; refrescar(); });
$('siguiente').addEventListener('click', () => { estado.pagina++; refrescar(); });

$('filtro').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-estado]');
  if (!btn) return;
  $('filtro').querySelectorAll('button').forEach((b) => b.classList.toggle('active', b === btn));
  estado.filtro = btn.dataset.estado;
  estado.pagina = 1;
  refrescar();
});

// Delegación de eventos en la tabla
$('lista').addEventListener('click', (e) => {
  const editar = e.target.closest('[data-editar]');
  const borrar = e.target.closest('[data-eliminar]');
  if (editar) abrirModal(estado.tickets.find((t) => t.id === Number(editar.dataset.editar)));
  if (borrar) eliminar(Number(borrar.dataset.eliminar));
});
$('lista').addEventListener('change', (e) => {
  const sel = e.target.closest('[data-estado-id]');
  if (sel) cambiarEstado(Number(sel.dataset.estadoId), sel.value);
});

refrescar();
