const prisma = require('../config/database');

const listar = async (req, res) => {
  try {
    const { estado } = req.query;
    const where = {};
    if (estado) where.estado = estado;

    const arreglos = await prisma.arreglo.findMany({
      where,
      orderBy: { fecha: 'desc' }
    });
    res.json({ success: true, data: arreglos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { cliente, tipoArreglo, valor, descripcion } = req.body;
    const arreglo = await prisma.arreglo.create({
      data: { cliente, tipoArreglo, valor, descripcion }
    });
    res.status(201).json({ success: true, data: arreglo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const arreglo = await prisma.arreglo.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: arreglo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await prisma.arreglo.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Arreglo eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const marcarPagado = async (req, res) => {
  try {
    const arreglo = await prisma.arreglo.update({
      where: { id: req.params.id },
      data: { estado: 'PAGADO' }
    });
    res.json({ success: true, data: arreglo, message: 'Arreglo marcado como pagado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar, marcarPagado };