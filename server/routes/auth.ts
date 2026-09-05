import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { dbService } from '../lib/db-store.ts';
import { signAuthToken, verifyAuthToken, AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

// Login handler (matches NextAuth Credentials Provider)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Debe ingresar correo y contraseña.' });
      return;
    }

    const user = await dbService.findUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas. Usuario no encontrado.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ error: 'Esta cuenta de administrador se encuentra inactiva.' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ error: 'Credenciales inválidas. Contraseña incorrecta.' });
      return;
    }

    const token = signAuthToken(user);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err: any) {
    console.error('Error during login:', err);
    res.status(500).json({ error: 'Error del servidor al procesar autenticación.' });
  }
});

// NextAuth catch-all endpoint compatibility
router.all('/[:punct:]*nextauth*', async (req: Request, res: Response) => {
  if (req.method === 'POST') {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Missing credentials' });
      return;
    }
    const user = await dbService.findUserByEmail(email);
    if (user && user.isActive && (await bcrypt.compare(password, user.password))) {
      const token = signAuthToken(user);
      res.json({
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
        token
      });
      return;
    }
    res.status(401).json({ error: 'Invalid credentials' });
    return;
  }

  res.json({ status: 'ok', provider: 'credentials' });
});

// Session validation endpoint
router.get('/session', async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  let token = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    res.status(401).json({ user: null });
    return;
  }

  const payload = verifyAuthToken(token);
  if (!payload) {
    res.status(401).json({ user: null });
    return;
  }

  res.json({
    user: payload,
    authenticated: true
  });
});

export default router;
