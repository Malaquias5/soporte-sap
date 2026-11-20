// Rutas /api/tickets
const { Router } = require('express');
const ctrl = require('./ticket.controller');

const router = Router();

router.get('/', ctrl.listar);           // ?page=1&limit=5&estado=Abierto
router.get('/resumen', ctrl.resumen);   // totales por estado
router.post('/', ctrl.crear);
router.put('/:id', ctrl.actualizar);
router.delete('/:id', ctrl.eliminar);

module.exports = router;
