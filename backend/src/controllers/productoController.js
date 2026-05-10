const prisma = require('../config/database');

const listar = async (req, res) => {
  try {
    const { q, categoria } = req.query;
    const where = { activo: true };
    
    if (q) {
      where.nombre = { contains: q, mode: 'insensitive' };
    }
    if (categoria) {
      where.categoria = categoria;
    }

    const productos = await prisma.producto.findMany({
      where,
      orderBy: { fechaIngreso: 'desc' }
    });
    res.json({ success: true, data: productos });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { nombre, categoria, talla, precio, cantidad, stockMinimo } = req.body;
    const producto = await prisma.producto.create({
      data: { nombre, categoria, talla, precio, cantidad, stockMinimo }
    });
    res.status(201).json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: req.params.id },
      data: req.body
    });
    res.json({ success: true, data: producto });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    await prisma.producto.update({
      where: { id: req.params.id },
      data: { activo: false }
    });
    res.json({ success: true, message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const marcarVendido = async (req, res) => {
  try {
    const producto = await prisma.producto.update({
      where: { id: req.params.id },
      data: { estado: 'VENDIDO', cantidad: 0 }
    });
    res.json({ success: true, data: producto, message: 'Producto marcado como vendido' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { listar, crear, actualizar, eliminar, marcarVendido };