const { pool } = require('../db');
const { HttpError } = require('../errors/HttpError');
const { mapCreateOrderBody } = require('./orderMapper');
const {
  insertItems,
  insertOrder,
  deleteOrderById,
  deleteItemsByProductIds,
  findAllItemsByOrderIds,
  findAllOrders,
  findItemsByOrderId,
  findOrderById,
  updateItemByProductId,
  updateOrderById,
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
      if (err.constraint === 'Order_pkey') {
        throw new HttpError(409, 'Order already exists');
      }
      if (err.constraint === 'Items_pkey') {
        throw new HttpError(400, 'Duplicate item in items list');
      }
      throw new HttpError(409, 'Conflict while creating order');
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

async function deleteOrder(orderId) {
  if (!orderId || typeof orderId !== 'string') {
    throw new HttpError(400, 'orderId must be a non-empty string');
  }

  const client = await pool.connect();

  try {
    const deleted = await deleteOrderById(client, orderId);
    if (!deleted) {
      throw new HttpError(404, 'Order not found');
    }
  } finally {
    client.release();
  }
}

async function updateOrder(orderId, rawBody) {
  if (!orderId || typeof orderId !== 'string') {
    throw new HttpError(400, 'orderId must be a non-empty string');
  }

  const updated = mapCreateOrderBody(rawBody);

  // Garante que estamos atualizando exatamente o pedido informado na URL.
  if (updated.orderId !== orderId) {
    throw new HttpError(400, 'numeroPedido does not match orderId from URL');
  }

  // Evita PK duplicada na tabela Items (orderId, productId) por duplicidade no payload.
  const seenProductIds = new Set();
  for (const item of updated.items) {
    if (seenProductIds.has(item.productId)) {
      throw new HttpError(400, 'Duplicate item in items list');
    }
    seenProductIds.add(item.productId);
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const existingOrder = await findOrderById(client, orderId);
    if (!existingOrder) {
      throw new HttpError(404, 'Order not found');
    }

    await updateOrderById(client, orderId, updated.value, updated.creationDate);

    const existingItems = await findItemsByOrderId(client, orderId);
    const existingByProductId = new Map(
      existingItems.map((row) => [
        Number(row.productId),
        { quantity: Number(row.quantity), price: Number(row.price) },
      ])
    );

    const incomingByProductId = new Map(
      updated.items.map((item) => [item.productId, item])
    );

    const toDelete = [];
    for (const productId of existingByProductId.keys()) {
      if (!incomingByProductId.has(productId)) {
        toDelete.push(productId);
      }
    }

    const toInsert = [];
    const toUpdate = [];

    for (const item of updated.items) {
      const prev = existingByProductId.get(item.productId);
      if (!prev) {
        toInsert.push(item);
        continue;
      }

      if (prev.quantity !== item.quantity || prev.price !== item.price) {
        toUpdate.push(item);
      }
    }

    if (toDelete.length > 0) {
      await deleteItemsByProductIds(client, orderId, toDelete);
    }

    for (const item of toUpdate) {
      await updateItemByProductId(client, orderId, item);
    }

    if (toInsert.length > 0) {
      await insertItems(client, orderId, toInsert);
    }

    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  // Retorna o estado atualizado no mesmo formato que o resto da API.
  return {
    orderId: updated.orderId,
    value: updated.value,
    creationDate: updated.creationDate,
    items: [...updated.items].sort((a, b) => a.productId - b.productId),
  };
}

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  deleteOrder,
  updateOrder,
};
