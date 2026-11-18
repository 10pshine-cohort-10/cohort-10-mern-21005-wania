import { Router } from 'express'
import { signup, login } from '../controllers/authController'
import { checkLoginAttempts } from '../middleware/loginAttemptMiddleware'

const router = Router()

// Handle user signup and login requests
router.post('/signup', signup)
router.post('/login', checkLoginAttempts, login)

export default router
