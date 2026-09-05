import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { dbService } from '../lib/db-store.ts';
import { formatWhatsAppMessage } from '../lib/whatsapp.ts';
import { authMiddleware, AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

const OrderCreationSchema = z.object({
  customer: z.object({
    firstName: z.string().trim().min(2, 'El nombre es obligatorio'),
    lastName: z.string().trim().min(2, 'El apellido es obligatorio'),
    phone: z.string().trim().min(6, 'El teléfono es obligatorio'),
    businessName: z.string().trim().optional()
  }),
  items: z.array(z.object({
    productId: z.string(),
    purchaseType: z.enum(['unit', 'bulk']),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1')
  })).min(1, 'El carrito debe contener al menos un producto')
});

// POST /api/orders (Public checkout endpoint)
router.post('/', async (req: Request, res: Response) => {
  try {
    const parseResult = OrderCreationSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        error: 'Datos de pedido inválidos',
        details: parseResult.error.flatten()
      });
      return;
    }

    const { customer, items } = parseResult.data;

    // Normalizing phone format with country code if needed
    let cleanPhone = customer.phone.replace(/[^0-9+]/g, '');
    if (!cleanPhone.startsWith('+')) {
      if (cleanPhone.startsWith('54')) {
        cleanPhone = '+' + cleanPhone;
      } else {
        cleanPhone = '+54 9 ' + cleanPhone;
      }
    }

    const createdOrder = await dbService.createOrder({
      customer: {
        ...customer,
        phone: cleanPhone
      },
      items
    });

    const { whatsappUrl, formattedMessage } = formatWhatsAppMessage(createdOrder);

    res.status(201).json({
      success: true,
      order: createdOrder,
      whatsappUrl,
      formattedMessage
    });
  } catch (err: any) {
    console.error('Error creating order:', err);
    res.status(500).json({ error: 'Error al registrar el pedido en el servidor.' });
  }
});

// GET /api/orders or /api/orders/admin/list
router.get(['/', '/admin/list'], authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const status = req.query.status as string;
    const orders = await dbService.getOrders(status);
    res.json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (err: any) {
    console.error('Error listing orders:', err);
    res.status(500).json({ error: 'Error al obtener lista de pedidos.' });
  }
});

// PATCH /api/orders/:id/status or /api/orders/admin/:id/status
router.patch(['/:id/status', '/admin/:id/status'], authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['Solicitado', 'Contestado'].includes(status)) {
      res.status(400).json({ error: 'Estado inválido. Debe ser Solicitado o Contestado.' });
      return;
    }

    const updated = await dbService.updateOrderStatus(
      req.params.id,
      status as 'Solicitado' | 'Contestado',
      {
        id: req.user!.id,
        name: req.user!.name,
        role: req.user!.role
      }
    );

    if (!updated) {
      res.status(404).json({ error: 'Pedido no encontrado.' });
      return;
    }

    res.json({ success: true, order: updated });
  } catch (err: any) {
    console.error('Error updating order status:', err);
    res.status(500).json({ error: 'Error al actualizar estado del pedido.' });
  }
});

export default router;
