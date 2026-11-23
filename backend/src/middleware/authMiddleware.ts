import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import JWT_SECRET from '../config/jwtConfig'

type TokenPayload = {
  userId: number
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. Please log in.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(
      token,
      JWT_SECRET,
    ) as TokenPayload

    req.userId = decoded.userId

    return next()
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}
