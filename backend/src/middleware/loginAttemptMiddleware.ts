import { Request, Response, NextFunction } from 'express'
import { RowDataPacket } from 'mysql2'
import db from '../config/database'

type LoginAttemptRow = RowDataPacket & {
  failed_attempts: number
  first_attempt_at: number
  blocked_until: number | null
}

const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW = 15 * 60 * 1000
const BLOCK_DURATION = 15 * 60 * 1000

// Check whether the IP address is temporarily blocked
export const checkLoginAttempts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ip = req.ip || 'unknown'
    const now = Date.now()

    const [rows] = await db.execute<LoginAttemptRow[]>(
      'SELECT failed_attempts, first_attempt_at, blocked_until FROM login_attempts WHERE ip_address = ?',
      [ip],
    )

    const attempt = rows[0]

    if (!attempt) {
      return next()
    }

    const firstAttemptAt = Number(attempt.first_attempt_at)
    const blockedUntil = attempt.blocked_until === null
      ? null
      : Number(attempt.blocked_until)

    if (blockedUntil !== null && now < blockedUntil) {
      return res.status(429).json({
        message: 'Too many failed login attempts. Try again later.',
      })
    }

    if (
      (blockedUntil !== null && now >= blockedUntil) ||
      now - firstAttemptAt >= ATTEMPT_WINDOW
    ) {
      await db.execute(
        'DELETE FROM login_attempts WHERE ip_address = ?',
        [ip],
      )
    }

    return next()
  } catch (error) {
    return next(error)
  }
}

// Record an unsuccessful login
export const recordFailedLogin = async (ip: string) => {
  const now = Date.now()

  const [rows] = await db.execute<LoginAttemptRow[]>(
    'SELECT failed_attempts, first_attempt_at, blocked_until FROM login_attempts WHERE ip_address = ?',
    [ip],
  )

  const attempt = rows[0]

  if (!attempt || now - Number(attempt.first_attempt_at) >= ATTEMPT_WINDOW) {
    await db.execute(
      `INSERT INTO login_attempts
       (ip_address, failed_attempts, first_attempt_at, blocked_until)
       VALUES (?, 1, ?, NULL)
       ON DUPLICATE KEY UPDATE
       failed_attempts = 1,
       first_attempt_at = VALUES(first_attempt_at),
       blocked_until = NULL`,
      [ip, now],
    )
    return
  }

  const failedAttempts = Number(attempt.failed_attempts) + 1
  const blockedUntil = failedAttempts >= MAX_ATTEMPTS
    ? now + BLOCK_DURATION
    : null

  await db.execute(
    'UPDATE login_attempts SET failed_attempts = ?, blocked_until = ? WHERE ip_address = ?',
    [failedAttempts, blockedUntil, ip],
  )
}

// Clear failed attempts after successful login
export const clearLoginAttempts = async (ip: string) => {
  await db.execute(
    'DELETE FROM login_attempts WHERE ip_address = ?',
    [ip],
  )
}
