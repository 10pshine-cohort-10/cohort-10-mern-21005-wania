import { Request, Response } from 'express'
import { signupUser, loginUser } from '../services/authService'
import {
  recordFailedLogin,
  clearLoginAttempts,
} from '../middleware/loginAttemptMiddleware'

type SignupRequest = {
  name?: string
  email?: string
  password?: string
}

type LoginRequest = {
  email?: string
  password?: string
}

// Handle signup requests
export const signup = async (
  req: Request<{}, {}, SignupRequest>,
  res: Response,
) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      message: 'Invalid request body',
    })
  }

  const { name, email, password } = req.body

  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required',
    })
  }

  try {
    const user = await signupUser({ name, email, password })

    return res.status(201).json({
      message: 'User registered successfully',
      user,
    })
  } catch (error) {
    return res.status(400).json({
      message: error instanceof Error
        ? error.message
        : 'Registration failed',
    })
  }
}

// Handle login requests
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return res.status(400).json({
      message: 'Invalid request body',
    })
  }

  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    })
  }

  const ip = req.ip || 'unknown'

  try {
    const result = await loginUser({ email, password })

    await clearLoginAttempts(ip)

    return res.status(200).json({
      message: 'Login successful',
      ...result,
    })
  } catch (error) {
    try {
      await recordFailedLogin(ip)
    } catch (recordError) {
      return res.status(500).json({
        message: 'Unable to process login. Please try again.',
      })
    }

    return res.status(401).json({
      message: error instanceof Error ? error.message : 'Login failed',
    })
  }
}
