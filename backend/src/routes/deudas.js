const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  listar, crear, registrarPago, generarMensajeWhatsApp
} = require('../controllers/deudaController');

router.use(authMiddleware);

router.get('/', listar);
router.post('/', crear);
router.post('/:id/pago', registrarPago);
router.get('/:id/whatsapp', generarMensajeWhatsApp);

module.exports = router;