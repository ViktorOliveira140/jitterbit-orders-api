# jitterbit-orders-api

![Node](https://img.shields.io/badge/node-%3E%3D20-brightgreen)
![License: MIT](https://img.shields.io/badge/license-MIT-blue)

API para gerenciamento de pedidos desenvolvida com Node.js, Express e PostgreSQL.

O `POST /order` recebe um payload no formato do desafio e faz o *mapping* para salvar no banco (PostgreSQL).

## Requisitos

- Node.js (>= 20)
- Docker + Docker Compose

## Como rodar (quick start)

1) Criar `.env`:

```bash
cp .env.example .env
```

2) Subir o Postgres:

```bash
docker compose up -d
docker compose ps
```

3) Rodar a API:

```bash
npm install
npm run dev
```

4) Testar health:

```bash
curl -i http://127.0.0.1:3000/health
```

Para parar a API: `Ctrl + C` no terminal onde ela está rodando.

Para parar o banco:

```bash
docker compose stop
```

## Variáveis de ambiente

Crie um `.env` baseado no `.env.example`.

Exemplo (valores padrão):

```bash
PORT=3000
HOST=127.0.0.1
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/jitterbit_orders
JWT_SECRET=change-me
JWT_EXPIRES_IN=1h
ADMIN_USER=admin
ADMIN_PASS=admin
```

## Endpoints

- `GET /health`
- `POST /auth/token` (gera token JWT)
- `GET /docs` (Swagger UI)
- `GET /docs/openapi.json` (OpenAPI spec)
- `POST /order`
- `GET /order/:orderId` (obrigatório)
- `GET /order/list` (opcional)
- `PUT /order/:orderId` (opcional)
- `DELETE /order/:orderId` (opcional)

Observação: todas as rotas de `/order` exigem o header `Authorization: Bearer <token>`. Apenas `/health` e `/docs` ficam públicos.

## Estrutura do projeto

```text
src/
  server.js                   # ponto de entrada (start do servidor HTTP)
  app.js                      # cria a aplicação Express (middlewares + rotas)
  db.js                       # pool de conexão com PostgreSQL (pg)
  routes/
    authRoutes.js             # rotas HTTP de /auth
    orderRoutes.js            # rotas HTTP de /order
  auth/
    authService.js            # emissão de token JWT
  orders/
    orderMapper.js            # validação + mapping do payload do desafio
    orderService.js           # regras de negócio (transação, erros)
    orderRepository.js        # queries SQL para Order/Items
  middlewares/
    authMiddleware.js         # valida Authorization: Bearer <token>
    errorHandler.js           # handler global de erros
    notFoundHandler.js        # handler de 404
  errors/
    HttpError.js              # erro HTTP com statusCode e details
```

## Status (cronograma)

- [x] Setup do projeto (Express + health check)
- [x] Postgres via Docker Compose + schema inicial
- [x] `POST /order` com mapping + persistência
- [x] `GET /order/:orderId` (obrigatório)
- [x] `GET /order/list` (opcional)
- [x] `PUT /order/:orderId` (opcional)
- [x] `DELETE /order/:orderId` (opcional)
- [x] Swagger / OpenAPI (opcional)
- [x] Autenticação JWT (opcional)

## Comandos úteis

- Lint: `npm run lint`
- Format: `npm run format`

## Exemplos

### POST /auth/token (gerar token)

**Request**

```bash
curl -s http://127.0.0.1:3000/auth/token \
  -H 'Content-Type: application/json' \
  --data '{"username":"admin","password":"admin"}'
```

Depois use o token nas requisições:

```bash
curl -i http://127.0.0.1:3000/order/list \
  -H 'Authorization: Bearer SEU_TOKEN'
```

### POST /order (criar pedido)

**Request**

```bash
curl -i -X POST 'http://127.0.0.1:3000/order' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  --data '{
    "numeroPedido": "v10089015vdb-01",
    "valorTotal": 10000,
    "dataCriacao": "2026-03-07T12:24:11.5299601+00:00",
    "items": [
      { "idItem": "2434", "quantidadeItem": 1, "valorItem": 1000 }
    ]
  }'
```

**Response (201)**

```json
{
  "orderId": "v10089015vdb",
  "value": 10000,
  "creationDate": "2026-03-07T12:24:11.529Z",
  "items": [
    {
      "productId": 2434,
      "quantity": 1,
      "price": 1000
    }
  ]
}
```

**Response (409)**

```json
{ "error": { "message": "Order already exists" } }
```

### GET /order/:orderId (buscar pedido)

```bash
curl -i http://127.0.0.1:3000/order/v10089015vdb \
  -H 'Authorization: Bearer SEU_TOKEN'
```

### GET /order/list (listar pedidos)

```bash
curl -i http://127.0.0.1:3000/order/list \
  -H 'Authorization: Bearer SEU_TOKEN'
```

### PUT /order/:orderId (atualizar pedido)

**Request**

```bash
curl -i -X PUT 'http://127.0.0.1:3000/order/vputtestvdb' \
  -H 'Authorization: Bearer SEU_TOKEN' \
  -H 'Content-Type: application/json' \
  --data '{
    "numeroPedido": "vputtestvdb-99",
    "valorTotal": 150,
    "dataCriacao": "2026-03-07T15:00:00.000Z",
    "items": [
      { "idItem": "2", "quantidadeItem": 3, "valorItem": 25 },
      { "idItem": "3", "quantidadeItem": 1, "valorItem": 5 }
    ]
  }'
```

### DELETE /order/:orderId (deletar pedido)

```bash
curl -i -X DELETE http://127.0.0.1:3000/order/vputtestvdb \
  -H 'Authorization: Bearer SEU_TOKEN'
```

### Mapping (resumo)

- `numeroPedido` → `orderId` (usa somente a parte antes do `-`)
- `valorTotal` → `value`
- `dataCriacao` → `creationDate` (ISO string)
- `items[].idItem` → `items[].productId`
- `items[].quantidadeItem` → `items[].quantity`
- `items[].valorItem` → `items[].price`
