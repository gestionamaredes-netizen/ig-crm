const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Importar módulos del backend
const db = require('../backend/database');
const routes = require('../backend/routes');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', '*'],
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inicializar database
db.init();

// API routes
app.use('/api', routes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor El Titán activo' });
});

// Para desarrollo local con vercel dev
if (process.env.NODE_ENV !== 'production') {
  app.get('/test', (req, res) => {
    res.json({ message: 'API funcionando correctamente' });
  });
}

module.exports = app;
