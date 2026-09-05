import React from 'react';
import { X, Phone, Store, Calendar, CheckCircle2, Clock, Send, Box, UserCheck } from 'lucide-react';
import { Order, OrderStatus } from '../../types/index.ts';

interface OrderDetailModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderDetailModal: React.FC<OrderDetailModalProps> = ({
  order,
  isOpen,
  onClose,
  onStatusChange
}) => {
  if (!isOpen || !order) return null;

  const isSolicitado = order.status === 'Solicitado';
  const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hola ${order.customer.firstName}! Te escribimos desde DistriQuiero sobre tu pedido ${order.orderNumber}.`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-[#fbf9f8] border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black text-[#c62828]">{order.orderNumber}</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                isSolicitado
                  ? 'bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2]'
                  : 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]'
              }`}
            >
              {order.status}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Customer & Meta Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-[#f7f7f7] rounded-xl border border-gray-100">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">
                Datos del Comprador
              </span>
              <p className="font-extrabold text-sm text-gray-900">
                {order.customer.firstName} {order.customer.lastName}
              </p>
              {order.customer.businessName && (
                <p className="text-xs text-gray-600 flex items-center gap-1 mt-0.5">
                  <Store className="w-3.5 h-3.5 text-gray-400" />
                  <span>{order.customer.businessName}</span>
                </p>
              )}
              <p className="text-xs font-mono text-gray-700 mt-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#2e7d32]" />
                <span>{order.customer.phone}</span>
              </p>
            </div>

            <div className="p-3.5 bg-[#f7f7f7] rounded-xl border border-gray-100 flex flex-col justify-between">
              <div>
                <span className="text-xs uppercase font-bold text-gray-500 block mb-1">
                  Fecha de Solicitud
                </span>
                <p className="text-xs text-gray-800 flex items-center gap-1 font-semibold">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{new Date(order.createdAt).toLocaleString('es-AR')}</span>
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Cambiar Estado:</span>
                <button
                  onClick={() => onStatusChange(order._id, isSolicitado ? 'Contestado' : 'Solicitado')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-all shadow-sm active:scale-95 ${
                    isSolicitado
                      ? 'bg-[#2e7d32] text-white hover:bg-[#236026]'
                      : 'bg-[#e65100] text-white hover:bg-[#b53f00]'
                  }`}
                >
                  {isSolicitado ? 'Marcar Contestado' : 'Revertir a Solicitado'}
                </button>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div>
            <h4 className="text-xs uppercase font-extrabold text-gray-700 tracking-wider mb-2">
              Artículos del Pedido ({order.items.length})
            </h4>
            <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#f0eded] text-gray-600 font-extrabold uppercase">
                    <th className="py-2.5 px-3">Producto</th>
                    <th className="py-2.5 px-3">Modalidad</th>
                    <th className="py-2.5 px-3 text-center">Cant.</th>
                    <th className="py-2.5 px-3 text-right">Unitario</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-gray-900">{item.title}</td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            item.purchaseType === 'bulk'
                              ? 'bg-[#c62828] text-white'
                              : 'bg-gray-200 text-gray-700'
                          }`}
                        >
                          {item.purchaseType === 'bulk' ? 'Bulto Cerrado' : 'Unidad'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold text-gray-800">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-600">
                        ${item.unitPrice.toLocaleString('es-AR')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-[#c62828]">
                        ${item.subtotal.toLocaleString('es-AR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-[#f7f7f7] border-t-2 border-gray-200 font-extrabold">
                    <td colSpan={4} className="py-3 px-3 text-right text-sm text-gray-700 uppercase">
                      Total del Pedido:
                    </td>
                    <td className="py-3 px-3 text-right text-base text-[#c62828] font-black">
                      ${order.totalAmount.toLocaleString('es-AR')}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Status History Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-[#f7f7f7] p-3.5 rounded-xl border border-gray-100">
              <span className="text-xs uppercase font-extrabold text-gray-600 block mb-2">
                Historial de Estados y Auditoría
              </span>
              <div className="space-y-1.5">
                {order.statusHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs text-gray-600">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
                      <strong>{h.status}</strong> — modificado por {String(h.changedBy)}
                    </span>
                    <span className="text-gray-400 text-[11px]">
                      {new Date(h.timestamp).toLocaleTimeString('es-AR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fbf9f8] border-t border-gray-100 flex items-center justify-between gap-3">
          <a
            href={waUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl text-xs font-extrabold shadow-sm active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Abrir Chat WhatsApp con Cliente</span>
          </a>

          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl hover:bg-gray-50"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
