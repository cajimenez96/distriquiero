import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle, Tag, Clock, Store, Phone, Box, Truck, ArrowLeft, Send, Copy, Check } from 'lucide-react';
import { OrderSubmissionResponse } from '../../types/index.ts';

interface OrderConfirmationModalProps {
  orderData: OrderSubmissionResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  orderData,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && orderData) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // Safe fallback if canvas is not initialized
      }
    }
  }, [isOpen, orderData]);

  const handleCopyMessage = () => {
    if (orderData?.formattedMessage) {
      navigator.clipboard.writeText(orderData.formattedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen || !orderData) return null;

  const { order, whatsappUrl } = orderData;
  const bulkCount = order.items.filter((i) => i.purchaseType === 'bulk').reduce((acc, i) => acc + i.quantity, 0);
  const unitCount = order.items.filter((i) => i.purchaseType === 'unit').reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 sm:p-7 flex flex-col items-center text-center animate-in zoom-in-95 duration-200 my-auto">
        {/* Brand Banner Card */}
        <div className="w-full max-w-xs bg-[#c62828] text-white py-2 px-4 rounded-xl font-black tracking-tight text-xl mb-4 shadow-sm">
          DistriQuiero
        </div>

        {/* Pulsing Success Badge */}
        <div className="relative my-2 flex items-center justify-center">
          <div className="absolute w-20 h-20 rounded-full bg-[#5dfd8a] opacity-30 animate-ping" />
          <div className="relative w-16 h-16 rounded-full bg-[#006d2f] text-white flex items-center justify-center shadow-lg">
            <CheckCircle className="w-10 h-10" />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-2xl font-black text-[#c62828] mt-3 tracking-tight">
          ¡Pedido Registrado con Éxito!
        </h2>

        {/* Order Identification Badges */}
        <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
          <span className="inline-flex items-center gap-1 bg-[#eae8e7] px-3 py-1 rounded-full text-sm font-extrabold text-gray-800">
            <Tag className="w-3.5 h-3.5 text-gray-500" />
            {order.orderNumber}
          </span>
          <span className="inline-flex items-center gap-1.5 bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#e65100] animate-pulse" />
            SOLICITADO
          </span>
        </div>

        {/* Order Recap Card */}
        <div className="w-full bg-[#f9f9f9] border border-gray-200 rounded-xl p-4 mt-5 text-left space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-gray-200">
            <span className="text-xs uppercase font-extrabold text-gray-700">Resumen de Operación</span>
            <span className="text-[11px] bg-[#e8f5e9] text-[#2e7d32] font-bold px-2 py-0.5 rounded-full">
              Mayorista B2B
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-600">
            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <Store className="w-4 h-4 text-gray-400" /> Cliente
              </span>
              <div className="text-right">
                <span className="font-bold text-gray-900 block">
                  {order.customer.firstName} {order.customer.lastName}
                </span>
                {order.customer.businessName && (
                  <span className="text-[11px] text-gray-500 block">
                    {order.customer.businessName}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <Phone className="w-4 h-4 text-[#2e7d32]" /> WhatsApp
              </span>
              <span className="font-bold text-gray-900">{order.customer.phone}</span>
            </div>

            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <Box className="w-4 h-4 text-gray-400" /> Artículos
              </span>
              <span className="font-bold text-gray-900 text-right">
                {order.items.length} productos ({bulkCount} bultos • {unitCount} sueltas)
              </span>
            </div>

            <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-gray-100">
              <span className="flex items-center gap-1.5 font-medium text-gray-500">
                <Truck className="w-4 h-4 text-gray-400" /> Entrega
              </span>
              <span className="font-semibold text-gray-900">Reparto Distribuidora (24-48 hs)</span>
            </div>

            <div className="flex items-center justify-between bg-[#f0eded] p-2.5 rounded-lg font-bold">
              <span className="text-gray-700 uppercase font-extrabold text-xs">Total a Pagar</span>
              <span className="text-xl text-[#c62828] font-black">
                ${order.totalAmount.toLocaleString('es-AR')}
              </span>
            </div>
          </div>
        </div>

        {/* Operational Next Steps Callout */}
        <div className="w-full bg-[#fff8e1] border border-[#ffe082] rounded-xl p-3 mt-4 text-left text-xs text-[#795548]">
          <p className="font-bold text-[#5d4037] mb-1">¿Qué sucede ahora?</p>
          <p className="leading-relaxed">
            Un asesor comercial de DistriQuiero confirmará stock por chat de WhatsApp y te enviará los
            datos bancarios o remito oficial para coordinar el despacho.
          </p>
        </div>

        {/* Action Button: WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full h-12 mt-5 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all text-sm sm:text-base"
        >
          <Send className="w-5 h-5" />
          <span>Abrir WhatsApp para confirmar pedido</span>
        </a>

        {/* Action Button: Copy Text Fallback */}
        <button
          type="button"
          onClick={handleCopyMessage}
          className="w-full h-10 mt-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors text-xs"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-gray-500" />}
          <span>{copied ? '¡Mensaje copiado al portapapeles!' : 'Copiar texto del pedido (opcional)'}</span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-3 text-xs text-gray-500 hover:text-gray-900 underline font-semibold flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al catálogo</span>
        </button>
      </div>
    </div>
  );
};
