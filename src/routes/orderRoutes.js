const { Router } = require('express');

const router = Router();

function notImplemented(res) {
  return res.status(501).json({
    error: {
      message: 'Not implemented yet',
    },
  });
}

router.post('/', (_req, res) => notImplemented(res));
router.get('/list', (_req, res) => notImplemented(res));
router.get('/:orderId', (_req, res) => notImplemented(res));
router.put('/:orderId', (_req, res) => notImplemented(res));
router.delete('/:orderId', (_req, res) => notImplemented(res));

module.exports = router;

