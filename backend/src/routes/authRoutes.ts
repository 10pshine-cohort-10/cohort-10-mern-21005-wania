import { Router } from 'express'
import { signup, login } from '../controllers/authController'

const router = Router()

// Handle user signup and login requests
router.post('/signup', signup)
router.post('/login', login)

export default router