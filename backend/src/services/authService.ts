import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import db from '../config/database'
import JWT_SECRET from '../config/jwtConfig'

export class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

type SignupData = {
  name: string
  email: string
  password: string
}

type LoginData = {
  email: string
  password: string
}

type UserRow = RowDataPacket & {
  id: number
  name: string
  email: string
  password: string
}

const MAX_PASSWORD_BYTES = 72

const isPasswordTooLong = (password: string) =>
  Buffer.byteLength(password, 'utf8') > MAX_PASSWORD_BYTES

const dummyPasswordHash = bcrypt.hashSync('dummy-password', 10)

export const signupUser = async ({ name, email, password }: SignupData) => {
  try {
    if (isPasswordTooLong(password)) {
      throw new AuthError('Password must not exceed 72 bytes')
    }

    const [existingUsers] = await db.execute<UserRow[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email],
    )

    if (existingUsers.length > 0) {
      throw new AuthError('Email is already registered')
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const [result] = await db.execute<ResultSetHeader>(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
    )

    return {
      id: result.insertId,
      name,
      email,
    }
  } catch (error) {
    if (error instanceof AuthError) {
      throw error
    }

    if (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'ER_DUP_ENTRY'
    ) {
      throw new AuthError('Email is already registered')
    }

    if (error instanceof Error) {
      throw error
    }

    throw new Error('Signup failed')
  }
}

export const loginUser = async ({ email, password }: LoginData) => {
  try {
    if (isPasswordTooLong(password)) {
      throw new AuthError('Password must not exceed 72 bytes')
    }

    const [users] = await db.execute<UserRow[]>(
      'SELECT id, name, email, password FROM users WHERE email = ?',
      [email],
    )

    const user = users[0]

    const passwordHash = user?.password ?? dummyPasswordHash
    const isPasswordValid = await bcrypt.compare(password, passwordHash)

    if (!user || !isPasswordValid) {
      throw new AuthError('Invalid email or password')
    }

    const token = jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: '1d' },
    )

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    }
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }

    throw new Error('Login failed')
  }
}
