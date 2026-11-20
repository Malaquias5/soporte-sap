// Configuración de la aplicación Express
const path = require('path');
const express = require('express');
const ticketRoutes = require('./modules/tickets/ticket.routes');
const { notFound, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/api/tickets', ticketRoutes);
app.use('/api', notFound);

app.use(errorHandler);

module.exports = app;
