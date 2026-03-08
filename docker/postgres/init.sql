CREATE TABLE IF NOT EXISTS "Order" (
  "orderId" TEXT PRIMARY KEY,
  "value" INTEGER NOT NULL,
  "creationDate" TIMESTAMPTZ NOT NULL
);

CREATE TABLE IF NOT EXISTS "Items" (
  "orderId" TEXT NOT NULL REFERENCES "Order"("orderId") ON DELETE CASCADE,
  "productId" INTEGER NOT NULL,
  "quantity" INTEGER NOT NULL,
  "price" INTEGER NOT NULL,
  PRIMARY KEY ("orderId", "productId")
);

CREATE INDEX IF NOT EXISTS "Items_orderId_idx" ON "Items" ("orderId");
