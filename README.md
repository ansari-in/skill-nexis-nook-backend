# Nook API

The Express API for the Nook e-commerce application. The current version uses an in-memory product, user, and order store so the complete frontend workflow can be developed immediately. Passwords are hashed with Node crypto and access is protected with JWT roles.

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
- `POST /api/auth/register` accepts `{ "name": "Asha", "email": "asha@example.com", "password": "secret123" }`.
- `POST /api/auth/login` accepts `{ "email": "asha@example.com", "password": "secret123" }` and returns a JWT.
- `GET /api/auth/me` returns the authenticated user.
- `POST /api/orders` requires `Authorization: Bearer <token>` and accepts `{ "items": [] }`.
- `GET /api/admin/products` requires an admin JWT.
- `POST`, `PUT`, and `DELETE /api/admin/products/:id` provide admin product CRUD.

The development admin account is `admin@nook.in` with password `admin123`. Set `ADMIN_PASSWORD` before deployment and replace this in-memory account with a database-backed user.

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