import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()
const port = process.env.PORT || 5000
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me'

app.use(cors())
app.use(express.json())

const products = [
  {
    id: 'aurora-headphones',
    name: 'Aurora Noise-Canceling Headphones',
    category: 'Audio',
    price: 189,
    rating: 4.9,
    badge: 'Best seller',
    description: 'Immersive sound, soft memory foam, and a 30-hour battery for focused listening.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'terra-carryall',
    name: 'Terra Everyday Carryall',
    category: 'Accessories',
    price: 118,
    rating: 4.8,
    badge: 'New arrival',
    description: 'A structured recycled canvas bag with room for the things you never leave behind.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'orbit-speaker',
    name: 'Orbit Mini Speaker',
    category: 'Audio',
    price: 76,
    rating: 4.7,
    badge: "Editor's pick",
    description: 'Small footprint. Surprisingly wide sound. Made for desks, shelves, and slow Sundays.',
    image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=1000&q=85',
  },
  {
    id: 'linework-lamp',
    name: 'Linework Table Lamp',
    category: 'Home',
    price: 142,
    rating: 4.6,
    badge: 'Low stock',
    description: 'Warm, directional light with a sculptural silhouette that stays out of the way.',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85',
  },
]

const orders = []

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'nook-api' })
})

app.get('/api/products', (request, response) => {
  const category = request.query.category
  const filteredProducts = category && category !== 'All'
    ? products.filter((product) => product.category === category)
    : products

  response.json({ products: filteredProducts, categories: ['All', ...new Set(products.map((product) => product.category))] })
})

app.post('/api/auth/login', (request, response) => {
  const { email } = request.body

  if (!email || !email.includes('@')) {
    return response.status(400).json({ message: 'A valid email is required.' })
  }

  const token = jwt.sign({ email, role: email.includes('admin') ? 'admin' : 'customer' }, jwtSecret, { expiresIn: '2h' })
  return response.json({ token, user: { email, role: email.includes('admin') ? 'admin' : 'customer' } })
})

app.post('/api/orders', (request, response) => {
  const { items, customer } = request.body

  if (!Array.isArray(items) || items.length === 0) {
    return response.status(400).json({ message: 'At least one item is required.' })
  }

  const order = {
    id: `NOOK-${String(orders.length + 1).padStart(4, '0')}`,
    items,
    customer: customer || 'guest@example.com',
    status: 'Processing',
    createdAt: new Date().toISOString(),
  }

  orders.push(order)
  return response.status(201).json({ order })
})

app.use((_request, response) => {
  response.status(404).json({ message: 'Route not found.' })
})

app.listen(port, () => {
  console.log(`Nook API listening on http://localhost:${port}`)
})
