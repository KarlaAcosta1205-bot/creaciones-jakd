const prisma = require('../config/database');

const listar = async (req, res) => {
  try {
    const deudas = await prisma.deuda.findMany({
      orderBy: { fecha: 'desc' },
      include: { cliente: true, pagos: true }
    });
    res.json({ success: true, data: deudas });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const crear = async (req, res) => {
  try {
    const { clienteId, montoTotal, descripcion } = req.body;
    const deuda = await prisma.deuda.create({
      data: { clienteId, montoTotal, descripcion }
    });
    res.status(201).json({ success: true, data: deuda });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const registrarPago = async (req, res) => {
  try {
    const { monto, metodo } = req.body;
    
    // Convertir a número para evitar concatenación de strings
    const montoNum = Number(monto);
    
    const deuda = await prisma.deuda.findUnique({
      where: { id: req.params.id }
    });

    if (!deuda) {
      return res.status(404).json({ success: false, error: 'Deuda no encontrada' });
    }

    // Convertir Decimal a Number antes de sumar
    const montoPagadoActual = Number(deuda.montoPagado);
    const montoTotal = Number(deuda.montoTotal);
    const nuevoPagado = montoPagadoActual + montoNum;
    
    let estado = 'PENDIENTE';
    if (nuevoPagado >= montoTotal) estado = 'PAGADO';
    else if (nuevoPagado > 0) estado = 'PARCIAL';

    await prisma.pago.create({
      data: { deudaId: req.params.id, monto: montoNum, metodo }
    });

    const deudaActualizada = await prisma.deuda.update({
      where: { id: req.params.id },
      data: { montoPagado: nuevoPagado, estado }
    });

    res.json({ success: true, data: deudaActualizada });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const generarMensajeWhatsApp = async (req, res) => {
  try {
    const deuda = await prisma.deuda.findUnique({
      where: { id: req.params.id },
      include: { cliente: true }
    });

    const saldo = deuda.montoTotal - deuda.montoPagado;
    const mensaje = `Hola ${deuda.cliente.nombre}, te recordamos que tienes un saldo pendiente con Creaciones JAKD por valor de $${saldo.toLocaleString()}. Por favor realiza tu pago lo antes posible. ¡Gracias! 🧵`;

    res.json({ success: true, data: { mensaje, telefono: deuda.cliente.telefono } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { listar, crear, registrarPago, generarMensajeWhatsApp };