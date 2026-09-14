import crypto from 'node:crypto'
import cors from 'cors'
import express from 'express'
import jwt from 'jsonwebtoken'

const app = express()
const port = process.env.PORT || 5000
const jwtSecret = process.env.JWT_SECRET || 'development-secret-change-me'

app.use(cors())
app.use(express.json())

const hashPassword = (password, salt = crypto.randomBytes(16).toString('hex')) => ({
  salt,
  passwordHash: crypto.scryptSync(password, salt, 64).toString('hex'),
})

const passwordMatches = (password, user) => {
  const hash = crypto.scryptSync(password, user.salt, 64).toString('hex')
  return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(user.passwordHash, 'hex'))
}

const makeId = (name) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
const makeToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, jwtSecret, { expiresIn: '2h' })
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role })

const products = [
  { id: 'jaipur-cotton-throw', name: 'Jaipur Cotton Throw', category: 'Home', price: 2499, rating: 4.8, badge: 'Handloom favourite', description: 'Soft cotton woven in a quiet Jaipur palette for slow evenings.', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=85' },
  { id: 'terracotta-mug-set', name: 'Terracotta Chai Mug Set', category: 'Kitchen', price: 899, rating: 4.7, badge: 'New arrival', description: 'A warm set of four earthenware mugs for chai, coffee, and conversation.', image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1000&q=85' },
  { id: 'indigo-linen-kurta', name: 'Indigo Linen Kurta', category: 'Wear', price: 3299, rating: 4.9, badge: 'Bestseller', description: 'Breathable linen, relaxed tailoring, and an indigo that gets better with time.', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=1000&q=85' },
  { id: 'brass-desk-lamp', name: 'Brass Study Lamp', category: 'Work', price: 4199, rating: 4.6, badge: 'Low stock', description: 'A focused pool of warm light for reading, making, and late-night ideas.', image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=1000&q=85' },
  { id: 'sandalwood-diffuser', name: 'Sandalwood Reed Diffuser', category: 'Wellness', price: 1299, rating: 4.7, badge: 'Made in India', description: 'Sandalwood, vetiver, and a little calm for the room you return to.', image: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=1000&q=85' },
  { id: 'kantha-tote', name: 'Kantha Market Tote', category: 'Accessories', price: 1599, rating: 4.8, badge: 'Limited run', description: 'One-of-a-kind recycled textile panels turned into an everyday carryall.', image: 'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1000&q=85' },
  { id: 'copper-water-bottle', name: 'Copper Water Bottle', category: 'Wellness', price: 1099, rating: 4.5, badge: 'Daily ritual', description: 'A hammered copper bottle designed for a cooler, more considered sip.', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&w=1000&q=85' },
  { id: 'block-print-cushion', name: 'Block Print Cushion', category: 'Home', price: 1399, rating: 4.7, badge: 'Crafted by hand', description: 'Hand-block printed cotton to bring a little pattern to your favourite corner.', image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=1000&q=85' },
]

const adminPassword = hashPassword(process.env.ADMIN_PASSWORD || 'admin123')
const users = [{ id: 'admin-001', name: 'Nook Admin', email: 'admin@nook.in', role: 'admin', ...adminPassword }]
const orders = []

function authenticate(request, response, next) {
  const header = request.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return response.status(401).json({ message: 'Please register or login to continue.' })

  try {
    request.user = jwt.verify(token, jwtSecret)
    return next()
  } catch {
    return response.status(401).json({ message: 'Your session has expired. Please login again.' })
  }
}

function requireAdmin(request, response, next) {
  if (request.user.role !== 'admin') return response.status(403).json({ message: 'Admin access is required.' })
  return next()
}

app.get('/api/health', (_request, response) => response.json({ status: 'ok', service: 'nook-api' }))

app.get('/api/products', (request, response) => {
  const category = request.query.category
  const filteredProducts = category && category !== 'All' ? products.filter((product) => product.category === category) : products
  response.json({ products: filteredProducts, categories: ['All', ...new Set(products.map((product) => product.category))] })
})

app.post('/api/auth/register', (request, response) => {
  const { name, email, password } = request.body
  if (!name || !email || !email.includes('@') || !password || password.length < 6) return response.status(400).json({ message: 'Name, valid email, and a password of 6+ characters are required.' })
  if (users.some((user) => user.email === email.toLowerCase())) return response.status(409).json({ message: 'An account with this email already exists.' })

  const user = { id: `user-${users.length + 1}`, name, email: email.toLowerCase(), role: 'customer', ...hashPassword(password) }
  users.push(user)
  return response.status(201).json({ token: makeToken(user), user: publicUser(user) })
})

app.post('/api/auth/login', (request, response) => {
  const { email, password } = request.body
  const user = users.find((candidate) => candidate.email === email?.toLowerCase())
  if (!user || !password || !passwordMatches(password, user)) return response.status(401).json({ message: 'Email or password is incorrect.' })
  return response.json({ token: makeToken(user), user: publicUser(user) })
})

app.get('/api/auth/me', authenticate, (request, response) => response.json({ user: publicUser(users.find((user) => user.id === request.user.id)) }))

app.post('/api/orders', authenticate, (request, response) => {
  const { items } = request.body
  if (!Array.isArray(items) || items.length === 0) return response.status(400).json({ message: 'At least one item is required.' })

  const order = { id: `NOOK-${String(orders.length + 1).padStart(4, '0')}`, items, customer: request.user.email, status: 'Processing', createdAt: new Date().toISOString() }
  orders.push(order)
  return response.status(201).json({ order })
})

app.get('/api/admin/products', authenticate, requireAdmin, (_request, response) => response.json({ products }))

app.post('/api/admin/products', authenticate, requireAdmin, (request, response) => {
  const { name, category, price, badge, description, image } = request.body
  if (!name || !category || !Number(price) || !image) return response.status(400).json({ message: 'Name, category, price, and image are required.' })
  const product = { id: `${makeId(name)}-${Date.now()}`, name, category, price: Number(price), rating: 5, badge: badge || 'New arrival', description: description || 'A considered addition to the Nook collection.', image }
  products.push(product)
  return response.status(201).json({ product })
})

app.put('/api/admin/products/:id', authenticate, requireAdmin, (request, response) => {
  const product = products.find((candidate) => candidate.id === request.params.id)
  if (!product) return response.status(404).json({ message: 'Product not found.' })
  Object.assign(product, request.body, { price: Number(request.body.price) })
  return response.json({ product })
})

app.delete('/api/admin/products/:id', authenticate, requireAdmin, (request, response) => {
  const index = products.findIndex((product) => product.id === request.params.id)
  if (index === -1) return response.status(404).json({ message: 'Product not found.' })
  const [product] = products.splice(index, 1)
  return response.json({ product })
})

app.use((_request, response) => response.status(404).json({ message: 'Route not found.' }))

app.listen(port, () => console.log(`Nook API listening on http://localhost:${port}`))
