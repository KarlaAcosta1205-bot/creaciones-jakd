const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Creaciones JAKD API funcionando 🧵' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor JAKD corriendo en http://localhost:${PORT}`);
});