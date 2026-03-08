const { HttpError } = require('../errors/HttpError');

function mapCreateOrderBody(body) {
  if (!body || typeof body !== 'object') {
    throw new HttpError(400, 'Request body is required');
  }

  const { numeroPedido, valorTotal, dataCriacao, items } = body;

  if (!numeroPedido || typeof numeroPedido !== 'string') {
    throw new HttpError(400, 'numeroPedido must be a non-empty string');
  }

  const orderId = numeroPedido.split('-')[0];

  const value = Number(valorTotal);
  if (!Number.isFinite(value)) {
    throw new HttpError(400, 'valorTotal must be a number');
  }
  if (!Number.isInteger(value) || value <= 0) {
    throw new HttpError(400, 'valorTotal must be a positive integer');
  }

  const creationDate = new Date(dataCriacao);
  if (!dataCriacao || typeof dataCriacao !== 'string' || Number.isNaN(creationDate.getTime())) {
    throw new HttpError(400, 'dataCriacao must be a valid ISO date string');
  }

  if (!Array.isArray(items) || items.length === 0) {
    throw new HttpError(400, 'items must be a non-empty array');
  }

  const mappedItems = items.map((item, index) => {
    if (!item || typeof item !== 'object') {
      throw new HttpError(400, 'items must be an array of objects', { index });
    }

    const { idItem, quantidadeItem, valorItem } = item;

    const productId = Number(idItem);
    if (!Number.isInteger(productId) || productId <= 0) {
      throw new HttpError(400, 'idItem must be a positive integer', { index });
    }

    const quantity = Number(quantidadeItem);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new HttpError(400, 'quantidadeItem must be a positive integer', { index });
    }

    const price = Number(valorItem);
    if (!Number.isInteger(price) || price <= 0) {
      throw new HttpError(400, 'valorItem must be a positive integer', { index });
    }

    return { productId, quantity, price };
  });

  return {
    orderId,
    value,
    creationDate: creationDate.toISOString(),
    items: mappedItems,
  };
}

module.exports = { mapCreateOrderBody };

