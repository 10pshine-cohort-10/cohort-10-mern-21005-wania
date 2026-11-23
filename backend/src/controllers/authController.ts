import { Request, Response } from 'express'
import {
  AuthError,
  signupUser,
  loginUser,
} from '../services/authService'
import {
  recordFailedLogin,
  releaseLoginReservation,
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

const releaseReservationSafely = async (reservationId: string) => {
  try {
    await releaseLoginReservation(reservationId)
  } catch (error) {
    console.error('Failed to release login reservation:', error)
  }
}

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

  if (
    typeof name !== 'string' ||
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !name.trim() ||
    !email.trim() ||
    !password
  ) {
    return res.status(400).json({
      message: 'Name, email, and password are required',
    })
  }

  try {
    const user = await signupUser({
      name: name.trim(),
      email: email.trim(),
      password,
    })

    return res.status(201).json({
      message: 'User registered successfully',
      user,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return res.status(400).json({
        message: error.message,
      })
    }

    console.error('Signup error:', error)

    return res.status(500).json({
      message: 'Unable to register user. Please try again.',
    })
  }
}

export const login = async (
  req: Request<{}, {}, LoginRequest>,
  res: Response,
) => {
  const reservationId = res.locals.loginReservationId as string | undefined
  const ip = res.locals.loginAttemptIp as string | undefined

  if (!reservationId || !ip) {
    if (reservationId) {
      await releaseReservationSafely(reservationId)
    }

    return res.status(500).json({
      message: 'Unable to process login. Please try again.',
    })
  }

  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    await releaseReservationSafely(reservationId)

    return res.status(400).json({
      message: 'Invalid request body',
    })
  }

  const { email, password } = req.body

  if (
    typeof email !== 'string' ||
    typeof password !== 'string' ||
    !email.trim() ||
    !password
  ) {
    await releaseReservationSafely(reservationId)

    return res.status(400).json({
      message: 'Email and password are required',
    })
  }

  try {
    const result = await loginUser({
      email: email.trim(),
      password,
    })

    await releaseReservationSafely(reservationId)

    return res.status(200).json({
      message: 'Login successful',
      ...result,
    })
  } catch (error) {
    if (error instanceof AuthError) {
      if (error.message === 'Invalid email or password') {
        try {
          await recordFailedLogin(ip, reservationId)
        } catch (recordError) {
          console.error('Failed to record login attempt:', recordError)
          await releaseReservationSafely(reservationId)

          return res.status(500).json({
            message: 'Unable to process login. Please try again.',
          })
        }

        return res.status(401).json({
          message: error.message,
        })
      }

      await releaseReservationSafely(reservationId)

      return res.status(400).json({
        message: error.message,
      })
    }

    await releaseReservationSafely(reservationId)

    console.error('Login error:', error)

    return res.status(500).json({
      message: 'Unable to process login. Please try again.',
    })
  }
}
