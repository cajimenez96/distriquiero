import { Router, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../lib/db-store.ts';
import { authMiddleware, requireSuperadmin, AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

const UserCreationSchema = z.object({
  name: z.string().trim().min(2, 'El nombre es requerido'),
  email: z.string().trim().email('Correo electrónico inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
  role: z.enum(['superadmin', 'admin']).default('admin')
});

// GET /api/admin/users (Superadmin only)
router.get('/', authMiddleware, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const users = await dbService.getAllUsers();
    res.json({ success: true, count: users.length, users });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener usuarios administradores.' });
  }
});

// POST /api/admin/users (Superadmin only)
router.post('/', authMiddleware, requireSuperadmin, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = UserCreationSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Validación de usuario fallida', details: parsed.error.flatten() });
      return;
    }

    const existing = await dbService.findUserByEmail(parsed.data.email);
    if (existing) {
      res.status(409).json({ error: 'Ya existe un usuario registrado con este correo.' });
      return;
    }

    const created = await dbService.createUser(parsed.data, {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    });

    res.status(201).json({ success: true, user: created });
  } catch (err: any) {
    console.error('Error creating admin user:', err);
    res.status(500).json({ error: 'Error al registrar nuevo administrador.' });
  }
});

export default router;
