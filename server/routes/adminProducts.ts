import { Router, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../lib/db-store.ts';
import { authMiddleware, AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

const BaseProductSchema = z.object({
  title: z.string().trim().min(2, 'El título es requerido'),
  slug: z.string().trim().optional(),
  sku: z.string().trim().optional().default(''),
  brand: z.string().trim().optional().default(''),
  category: z.string().trim().min(1, 'La categoría es requerida'),
  description: z.string().optional().default(''),
  images: z.array(z.string()).optional().default([]),
  priceUnit: z.number().min(0, 'El precio unitario no puede ser negativo'),
  priceBulk: z.number().min(0, 'El precio mayorista no puede ser negativo'),
  unitsPerBulk: z.number().int().min(1, 'Debe contener al menos 1 unidad por bulto').default(12),
  isOffer: z.boolean().optional().default(false),
  isPaused: z.boolean().optional().default(false)
});

const ProductSchema = BaseProductSchema.refine(
  (data) => data.priceBulk <= data.priceUnit * data.unitsPerBulk,
  {
    message: 'El precio por bulto debe ser menor o igual al total de las unidades sueltas (debe representar un ahorro comercial).',
    path: ['priceBulk']
  }
);

const ProductUpdateSchema = BaseProductSchema.partial().refine(
  (data) => {
    if (data.priceBulk !== undefined && data.priceUnit !== undefined && data.unitsPerBulk !== undefined) {
      return data.priceBulk <= data.priceUnit * data.unitsPerBulk;
    }
    return true;
  },
  {
    message: 'El precio por bulto debe ser menor o igual al total de las unidades sueltas.',
    path: ['priceBulk']
  }
);

// GET /api/admin/products
router.get('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const products = await dbService.getAllProductsAdmin();
    res.json({ success: true, count: products.length, products });
  } catch (err: any) {
    res.status(500).json({ error: 'Error al listar productos de administración.' });
  }
});

// POST /api/admin/products
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ProductSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      res.status(400).json({ 
        error: firstIssue || 'Validación fallida', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const created = await dbService.createProduct(parsed.data, {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    });

    res.status(201).json({ success: true, product: created });
  } catch (err: any) {
    console.error('Error creating product:', err);
    res.status(500).json({ error: 'Error al registrar el nuevo producto.' });
  }
});

// PUT /api/admin/products/:id
router.put('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parsed = ProductUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message;
      res.status(400).json({ 
        error: firstIssue || 'Validación fallida', 
        details: parsed.error.flatten() 
      });
      return;
    }

    const updated = await dbService.updateProduct(req.params.id, parsed.data, {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    });

    if (!updated) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    res.json({ success: true, product: updated });
  } catch (err: any) {
    console.error('Error updating product:', err);
    res.status(500).json({ error: 'Error al actualizar producto.' });
  }
});

// DELETE /api/admin/products/:id
router.delete('/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const success = await dbService.deleteProduct(req.params.id, {
      id: req.user!.id,
      name: req.user!.name,
      role: req.user!.role
    });

    if (!success) {
      res.status(404).json({ error: 'Producto no encontrado.' });
      return;
    }

    res.json({ success: true, message: 'Producto eliminado y auditado correctamente.' });
  } catch (err: any) {
    console.error('Error deleting product:', err);
    res.status(500).json({ error: 'Error al eliminar producto.' });
  }
});

export default router;
