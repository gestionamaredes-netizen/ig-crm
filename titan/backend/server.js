const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const routes = require('./routes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', process.env.FRONTEND_URL || '*'],
  credentials: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.init();

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor El Titán activo' });
});

// Servir frontend en producción
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(buildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor El Titán corriendo en puerto ${PORT}`);
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

// Manejo de errores
server.on('error', (err) => {
  console.error('Error del servidor:', err);
});

module.exports = app;
