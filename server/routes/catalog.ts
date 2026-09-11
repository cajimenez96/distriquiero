import { Router, Request, Response } from 'express';
import { dbService } from '../lib/db-store.ts';

const router = Router();

// GET /api/catalog
router.get('/', async (req: Request, res: Response) => {
  try {
    const { search, category, sort } = req.query;
    const products = await dbService.getCatalogProducts({
      search: search ? String(search) : undefined,
      category: category ? String(category) : undefined,
      sort: sort ? String(sort) : undefined
    });

    res.json({
      success: true,
      count: products.length,
      products
    });
  } catch (err: any) {
    console.error('Error fetching catalog:', err);
    res.status(500).json({ error: 'Error al obtener catálogo de productos.' });
  }
});

// GET /api/catalog/banners & /api/catalog/banners/list
router.get(['/banners', '/banners/list'], async (_req: Request, res: Response) => {
  try {
    const banners = await dbService.getBanners();
    res.json({ success: true, banners });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener banners.' });
  }
});

// GET /api/catalog/categories & /api/catalog/categories/list
router.get(['/categories', '/categories/list'], async (_req: Request, res: Response) => {
  try {
    const categories = await dbService.getCategories(false);
    res.json({ success: true, categories });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener categorías.' });
  }
});

// GET /api/catalog/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const product = await dbService.getProductById(req.params.id);
    if (!product || product.isPaused) {
      res.status(404).json({ error: 'Producto no disponible o dado de baja.' });
      return;
    }
    res.json({ success: true, product });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al obtener detalle del producto.' });
  }
});

export default router;
