const { Router } = require('express');
const { createOrder, getOrderById, listOrders } = require('../orders/orderService');

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
router.get('/list', async (_req, res, next) => {
  try {
    const orders = await listOrders();
    return res.status(200).json(orders);
  } catch (err) {
    return next(err);
  }
});
router.get('/:orderId', async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.orderId);
    return res.status(200).json(order);
  } catch (err) {
    return next(err);
  }
});
router.put('/:orderId', (_req, res) => notImplemented(res));
router.delete('/:orderId', (_req, res) => notImplemented(res));

module.exports = router;
