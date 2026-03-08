const { pool } = require('../db');
const { HttpError } = require('../errors/HttpError');
const { mapCreateOrderBody } = require('./orderMapper');
const { insertItems, insertOrder } = require('./orderRepository');

async function createOrder(rawBody) {
  const order = mapCreateOrderBody(rawBody);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    await insertOrder(client, order);
    await insertItems(client, order.orderId, order.items);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');

    // 23505 = unique_violation (PK duplicada, por exemplo).
    if (err && err.code === '23505') {
      throw new HttpError(409, 'Order already exists');
    }

    throw err;
  } finally {
    client.release();
  }

  return order;
}

module.exports = { createOrder };

