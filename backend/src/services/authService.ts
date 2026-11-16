
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { RowDataPacket, ResultSetHeader } from 'mysql2'
import db from '../config/database'

// Signup form data
type SignupData = {
  name: string
  email: string
  password: string
}

// Login form data
type LoginData = {
  email: string
  password: string
}

// Register a new user
export const signupUser = async ({ name, email, password }: SignupData) => {
  // Check whether the email is already registered
  const [existingUsers] = await db.execute<RowDataPacket[]>(
    'SELECT id FROM users WHERE email = ?',
    [email],
  )

  if (existingUsers.length > 0) {
    throw new Error('Email is already registered')
  }

  // Hash the password before saving it
  const hashedPassword = await bcrypt.hash(password, 10)

  // Save the new user in the database
  const [result] = await db.execute<ResultSetHeader>(
    'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
    [name, email, hashedPassword],
  )

  return {
    id: result.insertId,
    name,
    email,
  }
}

// Log in an existing user
export const loginUser = async ({ email, password }: LoginData) => {
  // Find the user by email
  const [users] = await db.execute<RowDataPacket[]>(
    'SELECT id, name, email, password FROM users WHERE email = ?',
    [email],
  )

  if (users.length === 0) {
    throw new Error('Invalid email')
  }

  const user = users[0]

  // Check the entered password
  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    throw new Error('Password is incorrect')
  }

  // Create a login token
  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
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
}
