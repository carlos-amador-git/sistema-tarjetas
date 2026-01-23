import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-me'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'default-refresh-secret'

const ACCESS_TOKEN_EXPIRY = '1h'
const REFRESH_TOKEN_EXPIRY = '7d'

export interface JWTPayload {
    userId: number
    username: string
    rol: string
}

/**
 * Generate an access token (short-lived)
 */
export function generateAccessToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY })
}

/**
 * Generate a refresh token (long-lived)
 */
export function generateRefreshToken(userId: number): string {
    return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY })
}

/**
 * Verify and decode an access token
 */
export function verifyAccessToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
}

/**
 * Verify and decode a refresh token
 */
export function verifyRefreshToken(token: string): { userId: number } {
    return jwt.verify(token, JWT_REFRESH_SECRET) as { userId: number }
}
