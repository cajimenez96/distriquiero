import { Router, Response } from 'express';
import { dbService } from '../lib/db-store.ts';
import { authMiddleware, type AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

// GET /api/admin/audit-logs
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 50;
    const logs = await dbService.getAuditLogs(limit);
    res.json({ success: true, count: logs.length, logs });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al recuperar registros de auditoría.' });
  }
});

export default router;
