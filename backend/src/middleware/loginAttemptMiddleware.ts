import { Request, Response, NextFunction } from 'express'
import { RowDataPacket } from 'mysql2'
import type { PoolConnection } from 'mysql2/promise'
import { randomUUID } from 'crypto'
import db from '../config/database'

type LoginAttemptRow = RowDataPacket & {
  failed_attempts: number
  first_attempt_at: number
  blocked_until: number | null
}

type ReservationCountRow = RowDataPacket & {
  active_count: number
}

type LoginCheckResult = {
  blocked: boolean
  reservationId?: string
}

const MAX_ATTEMPTS = 5
const ATTEMPT_WINDOW = 15 * 60 * 1000
const BLOCK_DURATION = 15 * 60 * 1000
const RESERVATION_DURATION = 5 * 60 * 1000
const MAX_TRANSACTION_RETRIES = 3

const isRetryableError = (error: unknown) => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error.code === 'ER_LOCK_DEADLOCK' ||
      error.code === 'ER_LOCK_WAIT_TIMEOUT')
  )
}

const withTransaction = async <T>(
  operation: (connection: PoolConnection) => Promise<T>,
): Promise<T> => {
  for (let attempt = 1; attempt <= MAX_TRANSACTION_RETRIES; attempt++) {
    const connection = await db.getConnection()

    try {
      await connection.beginTransaction()

      const result = await operation(connection)

      await connection.commit()

      return result
    } catch (error) {
      try {
        await connection.rollback()
      } catch {
      }

      if (!isRetryableError(error) || attempt === MAX_TRANSACTION_RETRIES) {
        throw error
      }

      await new Promise((resolve) => setTimeout(resolve, attempt * 100))
    } finally {
      connection.release()
    }
  }

  throw new Error('Unable to complete database transaction')
}

export const checkLoginAttempts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const ip = req.ip || 'unknown'
  const now = Date.now()

  try {
    const result = await withTransaction<LoginCheckResult>(
      async (connection) => {
        await connection.execute(
          `INSERT IGNORE INTO login_attempts
           (ip_address, failed_attempts, first_attempt_at, blocked_until)
           VALUES (?, 0, ?, NULL)`,
          [ip, now],
        )

        const [rows] = await connection.execute<LoginAttemptRow[]>(
          `SELECT failed_attempts, first_attempt_at, blocked_until
           FROM login_attempts
           WHERE ip_address = ?
           FOR UPDATE`,
          [ip],
        )

        const attempt = rows[0]
        let failedAttempts = Number(attempt.failed_attempts)

        const firstAttemptAt = Number(attempt.first_attempt_at)
        const blockedUntil = attempt.blocked_until === null
          ? null
          : Number(attempt.blocked_until)

        if (
          (blockedUntil !== null && now >= blockedUntil) ||
          (blockedUntil === null &&
            now - firstAttemptAt >= ATTEMPT_WINDOW)
        ) {
          failedAttempts = 0

          await connection.execute(
            `UPDATE login_attempts
             SET failed_attempts = 0,
                 first_attempt_at = ?,
                 blocked_until = NULL
             WHERE ip_address = ?`,
            [now, ip],
          )
        } else if (blockedUntil !== null && now < blockedUntil) {
          return { blocked: true }
        }

        await connection.execute(
          `DELETE FROM login_attempt_reservations
           WHERE ip_address = ? AND expires_at <= ?`,
          [ip, now],
        )

        const [countRows] =
          await connection.execute<ReservationCountRow[]>(
            `SELECT COUNT(*) AS active_count
             FROM login_attempt_reservations
             WHERE ip_address = ?`,
            [ip],
          )

        const activeCount = Number(countRows[0].active_count)

        if (failedAttempts + activeCount >= MAX_ATTEMPTS) {
          return { blocked: true }
        }

        const reservationId = randomUUID()

        await connection.execute(
          `INSERT INTO login_attempt_reservations
           (reservation_id, ip_address, expires_at)
           VALUES (?, ?, ?)`,
          [reservationId, ip, now + RESERVATION_DURATION],
        )

        return {
          blocked: false,
          reservationId,
        }
      },
    )

    if (result.blocked) {
      return res.status(429).json({
        message: 'Too many failed login attempts. Try again later.',
      })
    }

    res.locals.loginReservationId = result.reservationId
    res.locals.loginAttemptIp = ip

    return next()
  } catch (error) {
    return next(error)
  }
}

export const releaseLoginReservation = async (
  reservationId: string,
) => {
  await db.execute(
    'DELETE FROM login_attempt_reservations WHERE reservation_id = ?',
    [reservationId],
  )
}

export const recordFailedLogin = async (
  ip: string,
  reservationId: string,
) => {
  await withTransaction(async (connection) => {
    const now = Date.now()
    const windowStart = now - ATTEMPT_WINDOW
    const blockedUntil = now + BLOCK_DURATION

    await connection.execute(
      `INSERT IGNORE INTO login_attempts
       (ip_address, failed_attempts, first_attempt_at, blocked_until)
       VALUES (?, 0, ?, NULL)`,
      [ip, now],
    )

    const [rows] = await connection.execute<LoginAttemptRow[]>(
      `SELECT failed_attempts, first_attempt_at, blocked_until
       FROM login_attempts
       WHERE ip_address = ?
       FOR UPDATE`,
      [ip],
    )

    const attempt = rows[0]

    let failedAttempts = Number(attempt.failed_attempts)
    let firstAttemptAt = Number(attempt.first_attempt_at)

    let currentBlock = attempt.blocked_until === null
      ? null
      : Number(attempt.blocked_until)

    if (
      (currentBlock !== null && currentBlock <= now) ||
      (currentBlock === null && firstAttemptAt <= windowStart)
    ) {
      failedAttempts = 0
      firstAttemptAt = now
      currentBlock = null
    }

    failedAttempts += 1

    const newBlock = failedAttempts >= MAX_ATTEMPTS
      ? blockedUntil
      : currentBlock

    await connection.execute(
      `UPDATE login_attempts
       SET failed_attempts = ?,
           first_attempt_at = ?,
           blocked_until = ?
       WHERE ip_address = ?`,
      [failedAttempts, firstAttemptAt, newBlock, ip],
    )

    await connection.execute(
      'DELETE FROM login_attempt_reservations WHERE reservation_id = ?',
      [reservationId],
    )
  })
}
