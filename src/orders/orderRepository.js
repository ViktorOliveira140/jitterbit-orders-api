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

module.exports = { insertOrder, insertItems };

