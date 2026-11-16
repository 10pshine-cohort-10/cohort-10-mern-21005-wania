
import { Request, Response } from 'express'
import { signupUser, loginUser } from '../services/authService'

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
  const { name, email, password } = req.body

  // Check that all required fields are provided
  if (!name || !email || !password) {
    return res.status(400).json({
      message: 'Name, email, and password are required',
    })
  }

  const user = await signupUser({ name, email, password })

  return res.status(201).json({
    message: 'User registered successfully',
    user,
  })
}

// Handle login requests
export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
) => {
  const { email, password } = req.body

  // Check that both fields are provided
  if (!email || !password) {
    return res.status(400).json({
      message: 'Email and password are required',
    })
  }

  try {
    const result = await loginUser({ email, password })

    return res.status(200).json({
      message: 'Login successful',
      ...result,
    })
  } catch (error) {
    return res.status(401).json({
      message: error instanceof Error ? error.message : 'Login failed',
    })
  }
}
