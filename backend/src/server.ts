import 'dotenv/config'
import './config/jwtConfig'
import express from 'express'
import db from './config/database'
import authRoutes from './routes/authRoutes'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(express.json())
app.use('/api/auth', authRoutes)

app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' })
})

db.getConnection()
  .then((connection) => {
    console.log('MySQL database connected successfully')
    connection.release()
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : String(error)

    console.error('MySQL connection failed:', message)
  })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
