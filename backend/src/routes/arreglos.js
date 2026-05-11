const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const {
  listar, crear, actualizar, eliminar, marcarPagado
} = require('../controllers/arregloController');

router.use(authMiddleware);

router.get('/', listar);
router.post('/', crear);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);
router.patch('/:id/pagado', marcarPagado);

module.exports = router;