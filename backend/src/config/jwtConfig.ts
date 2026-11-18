const jwtSecret = process.env.JWT_SECRET

if (!jwtSecret || !jwtSecret.trim()) {
  throw new Error('JWT_SECRET must be set in backend/.env')
}

const JWT_SECRET: string = jwtSecret

export default JWT_SECRET