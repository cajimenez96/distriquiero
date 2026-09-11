import { Router, Response } from 'express';
import { dbService } from '../lib/db-store.ts';
import { authMiddleware, type AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

// GET /api/admin/categories
router.get('/', authMiddleware, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const categories = await dbService.getCategories(true);
    res.json({ success: true, count: categories.length, categories });
  } catch (err: any) {
    console.error('Error in GET /api/admin/categories:', err);
    res.status(500).json({ error: 'Error al recuperar categorías administrativas.' });
  }
});

// POST /api/admin/categories
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, order, isActive } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'El nombre de la categoría es obligatorio.' });
      return;
    }

    const category = await dbService.createCategory(
      { name, slug, order, isActive },
      req.user!
    );
    res.status(201).json({ success: true, category });
  } catch (err: any) {
    console.error('Error in POST /api/admin/categories:', err);
    res.status(400).json({ error: err.message || 'Error al crear la categoría.' });
  }
});

// PUT /api/admin/categories/:id
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, slug, order, isActive } = req.body;
    const updateData: any = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        res.status(400).json({ error: 'El nombre de la categoría no puede estar vacío.' });
        return;
      }
      updateData.name = name.trim();
    }
    if (slug !== undefined) updateData.slug = slug.trim();
    if (order !== undefined) updateData.order = Number(order);
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await dbService.updateCategory(req.params.id, updateData, req.user!);
    if (!updated) {
      res.status(404).json({ error: 'Categoría no encontrada.' });
      return;
    }

    res.json({ success: true, category: updated });
  } catch (err: any) {
    console.error('Error in PUT /api/admin/categories/:id:', err);
    res.status(400).json({ error: err.message || 'Error al actualizar la categoría.' });
  }
});

// DELETE /api/admin/categories/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { reassignToCategoryId } = req.body || {};
    const result = await dbService.deleteCategory(
      req.params.id,
      reassignToCategoryId,
      req.user!
    );

    if (!result.success) {
      res.status(400).json({ error: result.error || 'Error al eliminar la categoría.' });
      return;
    }

    res.json({
      success: true,
      message: 'Categoría eliminada con éxito.',
      reassignedCount: result.reassignedCount,
      targetCategory: result.targetCategory
    });
  } catch (err: any) {
    console.error('Error in DELETE /api/admin/categories/:id:', err);
    res.status(400).json({ error: err.message || 'Error al eliminar la categoría.' });
  }
});

export default router;
