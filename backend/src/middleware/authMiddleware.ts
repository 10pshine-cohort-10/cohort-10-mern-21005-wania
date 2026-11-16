
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

type TokenPayload = {
  userId: number
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers.authorization

  // Check if the request includes a token
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Access denied. Please log in.',
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as TokenPayload

    req.userId = decoded.userId

    next()
  } catch {
    return res.status(401).json({
      message: 'Invalid or expired token',
    })
  }
}
