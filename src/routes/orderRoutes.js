const { Router } = require('express');
const {
  createOrder,
  deleteOrder,
  getOrderById,
  listOrders,
  updateOrder,
} = require('../orders/orderService');

const router = Router();

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
router.put('/:orderId', async (req, res, next) => {
  try {
    const updated = await updateOrder(req.params.orderId, req.body);
    return res.status(200).json(updated);
  } catch (err) {
    return next(err);
  }
});
router.delete('/:orderId', async (req, res, next) => {
  try {
    await deleteOrder(req.params.orderId);
    return res.status(204).send();
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
