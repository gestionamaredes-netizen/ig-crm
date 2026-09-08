const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5000', '*'],
  credentials: true
}));

// Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lazy initialization of database and routes
let initialized = false;

const initializeApp = () => {
  if (!initialized) {
    try {
      const db = require('../backend/database');
      const routes = require('../backend/routes');
      db.init();
      app.use('/api', routes);
      initialized = true;
    } catch (err) {
      console.error('Error initializing app:', err);
    }
  }
};

// Initialize on first request
app.use((req, res, next) => {
  initializeApp();
  next();
});

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
