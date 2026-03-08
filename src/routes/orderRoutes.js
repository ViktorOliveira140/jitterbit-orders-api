const { Router } = require('express');
const { createOrder } = require('../orders/orderService');

const router = Router();

function notImplemented(res) {
  return res.status(501).json({
    error: {
      message: 'Not implemented yet',
    },
  });
}

router.post('/', async (req, res, next) => {
  try {
    const created = await createOrder(req.body);
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
});
router.get('/list', (_req, res) => notImplemented(res));
router.get('/:orderId', (_req, res) => notImplemented(res));
router.put('/:orderId', (_req, res) => notImplemented(res));
router.delete('/:orderId', (_req, res) => notImplemented(res));

module.exports = router;
