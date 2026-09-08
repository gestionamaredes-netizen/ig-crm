const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./database');
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

db.init();

app.use('/api', routes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Servidor El Titán activo' });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor El Titán corriendo en puerto ${PORT}`);
});
