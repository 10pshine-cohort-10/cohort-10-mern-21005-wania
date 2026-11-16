import 'dotenv/config'
import express from 'express'
import db from './config/database'
import authRoutes from './routes/authRoutes'

const app = express()
const PORT = Number(process.env.PORT) || 5000

app.use(express.json())
app.use('/api/auth', authRoutes)

// Check if the API is running
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' })
})

// Check the MySQL connection
db.getConnection()
  .then((connection) => {
    console.log('MySQL database connected successfully')
    connection.release()
  })
  .catch((error) => {
    console.error('MySQL connection failed:', error.message)
  })

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})