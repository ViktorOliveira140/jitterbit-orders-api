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

module.exports = { insertOrder, insertItems, findOrderById, findItemsByOrderId };
