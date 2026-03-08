const { pool } = require('../db');
const { HttpError } = require('../errors/HttpError');
const { mapCreateOrderBody } = require('./orderMapper');
const {
  insertItems,
  insertOrder,
  findAllItemsByOrderIds,
  findAllOrders,
  findItemsByOrderId,
  findOrderById,
} = require('./orderRepository');

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

async function getOrderById(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    throw new HttpError(400, 'orderId must be a non-empty string');
  }

  const client = await pool.connect();

  try {
    const orderRow = await findOrderById(client, orderId);
    if (!orderRow) {
      throw new HttpError(404, 'Order not found');
    }

    const itemRows = await findItemsByOrderId(client, orderId);

    const creationDate =
      orderRow.creationDate instanceof Date
        ? orderRow.creationDate.toISOString()
        : new Date(orderRow.creationDate).toISOString();

    return {
      orderId: orderRow.orderId,
      value: Number(orderRow.value),
      creationDate,
      items: itemRows.map((row) => ({
        productId: Number(row.productId),
        quantity: Number(row.quantity),
        price: Number(row.price),
      })),
    };
  } finally {
    client.release();
  }
}

async function listOrders() {
  const client = await pool.connect();

  try {
    const orderRows = await findAllOrders(client);
    if (orderRows.length === 0) {
      return [];
    }

    const orderIds = orderRows.map((row) => row.orderId);
    const itemRows = await findAllItemsByOrderIds(client, orderIds);

    const itemsByOrderId = new Map();
    for (const row of itemRows) {
      const list = itemsByOrderId.get(row.orderId) || [];
      list.push({
        productId: Number(row.productId),
        quantity: Number(row.quantity),
        price: Number(row.price),
      });
      itemsByOrderId.set(row.orderId, list);
    }

    return orderRows.map((row) => {
      const creationDate =
        row.creationDate instanceof Date
          ? row.creationDate.toISOString()
          : new Date(row.creationDate).toISOString();

      return {
        orderId: row.orderId,
        value: Number(row.value),
        creationDate,
        items: itemsByOrderId.get(row.orderId) || [],
      };
    });
  } finally {
    client.release();
  }
}

module.exports = { createOrder, getOrderById, listOrders };
