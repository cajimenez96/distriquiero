import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'distriquiero_jwt_secret_dev_key_2026';

export interface AuthTokenPayload {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'admin';
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export function signAuthToken(user: { _id: any; name: string; email: string; role: 'superadmin' | 'admin' }): string {
  const payload: AuthTokenPayload = {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role
  };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyAuthToken(token: string): AuthTokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
  } catch (err) {
    return null;
  }
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  let token = '';

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    token = req.headers['x-auth-token'] as string;
  }

  if (!token) {
    res.status(401).json({ error: 'Acceso no autorizado. Se requiere token de sesión.' });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Sesión inválida o expirada. Vuelva a iniciar sesión.' });
    return;
  }

  req.user = payload;
  next();
}

export function requireSuperadmin(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'superadmin') {
    res.status(403).json({ error: 'Acceso restringido. Se requiere rol de Superadmin.' });
    return;
  }
  next();
}
