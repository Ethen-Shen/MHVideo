import jwt, { SignOptions } from 'jsonwebtoken';
import { config } from '../config';

const JWT_SECRET = config.JWT_SECRET;
const JWT_EXPIRES_IN: string = config.JWT_EXPIRES_IN;
const JWT_REFRESH_EXPIRES_IN: string = config.JWT_REFRESH_EXPIRES_IN;

export interface TokenPayload {
  userId: string;
  email?: string;
  role?: string;
}

export function generateToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as SignOptions);
}

export function generateRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN } as SignOptions);
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}
