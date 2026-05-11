const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const arregloRoutes = require('./routes/arreglos');
const clienteRoutes = require('./routes/clientes');
const deudaRoutes = require('./routes/deudas');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/arreglos', arregloRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/deudas', deudaRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Creaciones JAKD API funcionando 🧵' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor JAKD corriendo en http://localhost:${PORT}`);
});