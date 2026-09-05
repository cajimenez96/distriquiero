import { IOrder } from '../models/index.ts';

export function formatWhatsAppMessage(order: any, companyPhone?: string): { whatsappUrl: string; formattedMessage: string } {
  const phone = companyPhone || process.env.COMPANY_WHATSAPP_PHONE || '5491145982210';
  const cleanPhone = phone.replace(/[^0-9]/g, '');

  const itemsText = order.items.map((item: any) => {
    const typeLabel = item.purchaseType === 'bulk' ? '(Bulto)' : '(Unidad)';
    const formattedSubtotal = `$${item.subtotal.toLocaleString('es-AR')}`;
    return `• ${item.quantity}x ${item.title} ${typeLabel} - ${formattedSubtotal}`;
  }).join('\n\n');

  const formattedTotal = `$${order.totalAmount.toLocaleString('es-AR')}`;
  const businessLine = order.customer.businessName ? `Comercio: ${order.customer.businessName}\n` : '';

  const message = `🛒 NUEVO PEDIDO - DISTRIQUIERO
Pedido: ${order.orderNumber}
Cliente: ${order.customer.firstName} ${order.customer.lastName}
${businessLine}Teléfono: ${order.customer.phone}

📋 DETALLE DEL PEDIDO:

${itemsText}

💰 TOTAL ESTIMADO: ${formattedTotal}
Pedido generado desde la web. Aguardo confirmación para coordinar entrega y pago.`;

  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMessage}`;

  return {
    whatsappUrl,
    formattedMessage: message
  };
}
