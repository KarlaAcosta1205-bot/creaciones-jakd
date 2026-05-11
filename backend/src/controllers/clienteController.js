const prisma = require('../config/database');

const listar = async (req, res) => {
  try {
    const { q } = req.query;
    const where = {};
    if (q) {
      where.nombre = { contains: q, mode: 'insensitive' };
    }

    const clientes = await prisma.cliente.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { deudas: true }
    });
    res.json({ success: true, data: clientes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, telefono, email, direccion } = req.body;
    const cliente = await prisma.cliente.create({
      data: { nombre, telefono, email, direccion }
    });
    res.status(201).json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const cliente = await prisma.cliente.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: cliente });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await prisma.cliente.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Cliente eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar };