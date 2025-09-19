import jwt, { Secret } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { IUser } from '@/types';

interface JWTPayload {
  id: string;
  email: string;
  role: string;
}

// Generate JWT Token
export const generateToken = (user: IUser): string => {
  const payload: JWTPayload = {
    id: user._id,
    email: user.email,
    role: user.role
  };

  const secret: Secret = (process.env.JWT_SECRET || 'dev_secret') as Secret;
  const expires: StringValue = (process.env.JWT_EXPIRE as StringValue) || '7d';
  return jwt.sign(payload, secret, { expiresIn: expires });
};

// Verify JWT Token
export const verifyToken = (token: string): JWTPayload => {
  const secret: Secret = (process.env.JWT_SECRET || 'dev_secret') as Secret;
  return jwt.verify(token, secret) as JWTPayload;
};

// Generate cookie options
export const getCookieOptions = () => {
  return {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: (process.env.NODE_ENV === 'production' ? 'none' : 'lax') as 'none' | 'lax'
  };
};
