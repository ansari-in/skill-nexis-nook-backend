# Nook API

The Express API for the Nook e-commerce application. The current version uses an in-memory product and order store so the complete frontend workflow can be developed immediately. The API already uses the shape intended for a MongoDB/Mongoose persistence layer.

## Run locally

```bash
pnpm install
pnpm dev
```

The API listens on `http://localhost:5000` by default.

```env
PORT=5000
JWT_SECRET=replace-this-in-development
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nook
```

`MONGODB_URI` is reserved for the upcoming Mongoose connection. Never commit real credentials.

## Routes

- `GET /api/health` returns service health.
- `GET /api/products` returns products and categories. Use `?category=Audio` to filter.
- `POST /api/auth/login` accepts `{ "email": "shopper@example.com" }` and returns a JWT.
- `POST /api/orders` accepts `{ "items": [], "customer": "shopper@example.com" }` and creates an order.

## Scripts

- `pnpm dev` runs the API with Node watch mode.
- `pnpm start` runs the API normally.
- `pnpm test` runs Node's test runner when API tests are added.

## Deployment roadmap

1. Add Mongoose models for users, products, and orders.
2. Move product and order handlers into controllers and repositories.
3. Add password hashing, JWT middleware, role checks, and admin CRUD routes.
4. Add request validation and API tests.
5. Deploy the API to Render and the database to MongoDB Atlas.