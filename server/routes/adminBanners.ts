import { Router, Response } from 'express';
import { dbService } from '../lib/db-store.ts';
import { authMiddleware, type AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

// GET /api/admin/banners
router.get('/', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const banners = await dbService.getAllBannersAdmin();
    res.json({ success: true, count: banners.length, banners });
  } catch (err: any) {
    console.error('Error in GET /api/admin/banners:', err);
    res.status(500).json({ error: 'Error al recuperar banners administrativos.' });
  }
});

// POST /api/admin/banners
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, imageUrl, targetCategory, isActive, order } = req.body;
    if (!imageUrl || typeof imageUrl !== 'string') {
      res.status(400).json({ error: 'La URL de la imagen es obligatoria.' });
      return;
    }

    const banner = await dbService.createBanner(
      { title, imageUrl, targetCategory, isActive, order },
      req.user!
    );
    res.status(201).json({ success: true, banner });
  } catch (err: any) {
    console.error('Error in POST /api/admin/banners:', err);
    res.status(400).json({ error: err.message || 'Error al crear el banner.' });
  }
});

// PUT /api/admin/banners/:id
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, imageUrl, targetCategory, isActive, order } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = String(title).trim();
    if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl).trim();
    if (targetCategory !== undefined) updateData.targetCategory = String(targetCategory).trim();
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);
    if (order !== undefined) updateData.order = Number(order);

    const updated = await dbService.updateBanner(req.params.id, updateData, req.user!);
    if (!updated) {
      res.status(404).json({ error: 'Banner no encontrado.' });
      return;
    }

    res.json({ success: true, banner: updated });
  } catch (err: any) {
    console.error('Error in PUT /api/admin/banners/:id:', err);
    res.status(400).json({ error: err.message || 'Error al actualizar el banner.' });
  }
});

// DELETE /api/admin/banners/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await dbService.deleteBanner(req.params.id, req.user!);
    if (!success) {
      res.status(404).json({ error: 'Banner no encontrado o ya eliminado.' });
      return;
    }

    res.json({ success: true, message: 'Banner eliminado correctamente.' });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/banners/:id:', err);
    res.status(400).json({ error: err.message || 'Error al eliminar el banner.' });
  }
});

export default router;
