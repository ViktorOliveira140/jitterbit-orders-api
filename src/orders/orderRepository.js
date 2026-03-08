async function insertOrder(client, order) {
  await client.query(
    'INSERT INTO "Order" ("orderId", "value", "creationDate") VALUES ($1, $2, $3)',
    [order.orderId, order.value, order.creationDate]
  );
}

async function insertItems(client, orderId, items) {
  for (const item of items) {
    await client.query(
      'INSERT INTO "Items" ("orderId", "productId", "quantity", "price") VALUES ($1, $2, $3, $4)',
      [orderId, item.productId, item.quantity, item.price]
    );
  }
}

async function findOrderById(client, orderId) {
  const result = await client.query(
    'SELECT "orderId", "value", "creationDate" FROM "Order" WHERE "orderId" = $1',
    [orderId]
  );

  return result.rows[0] || null;
}

async function findItemsByOrderId(client, orderId) {
  const result = await client.query(
    'SELECT "productId", "quantity", "price" FROM "Items" WHERE "orderId" = $1 ORDER BY "productId" ASC',
    [orderId]
  );

  return result.rows;
}

async function findAllOrders(client) {
  const result = await client.query(
    'SELECT "orderId", "value", "creationDate" FROM "Order" ORDER BY "creationDate" DESC, "orderId" ASC'
  );

  return result.rows;
}

async function findAllItemsByOrderIds(client, orderIds) {
  const result = await client.query(
    'SELECT "orderId", "productId", "quantity", "price" FROM "Items" WHERE "orderId" = ANY($1) ORDER BY "orderId" ASC, "productId" ASC',
    [orderIds]
  );

  return result.rows;
}

async function deleteOrderById(client, orderId) {
  const result = await client.query('DELETE FROM "Order" WHERE "orderId" = $1', [
    orderId,
  ]);

  return result.rowCount;
}

async function updateOrderById(client, orderId, value, creationDate) {
  const result = await client.query(
    'UPDATE "Order" SET "value" = $2, "creationDate" = $3 WHERE "orderId" = $1',
    [orderId, value, creationDate]
  );

  return result.rowCount;
}

async function deleteItemsByProductIds(client, orderId, productIds) {
  const result = await client.query(
    'DELETE FROM "Items" WHERE "orderId" = $1 AND "productId" = ANY($2)',
    [orderId, productIds]
  );

  return result.rowCount;
}

async function updateItemByProductId(client, orderId, item) {
  const result = await client.query(
    'UPDATE "Items" SET "quantity" = $3, "price" = $4 WHERE "orderId" = $1 AND "productId" = $2',
    [orderId, item.productId, item.quantity, item.price]
  );

  return result.rowCount;
}

module.exports = {
  insertOrder,
  insertItems,
  findOrderById,
  findItemsByOrderId,
  findAllOrders,
  findAllItemsByOrderIds,
  deleteOrderById,
  updateOrderById,
  deleteItemsByProductIds,
  updateItemByProductId,
};
