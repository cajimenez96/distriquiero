import React, { useState } from 'react';
import { X, Trash2, Send, ShoppingBag, Truck, CheckCircle, ShieldAlert, Store } from 'lucide-react';
import { useCart } from '../../context/CartContext.tsx';
import { useToast } from '../ui/Toast.tsx';
import { OrderSubmissionResponse } from '../../types/index.ts';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderResponse: OrderSubmissionResponse) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onOrderSuccess
}) => {
  const {
    items,
    totalItems,
    cartTotal,
    subtotalUnits,
    subtotalBulks,
    wholesaleSavings,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  const { error, success } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const minWholesaleThreshold = 50000;
  const isGoalReached = cartTotal >= minWholesaleThreshold;
  const progressPercent = Math.min(100, Math.round((cartTotal / minWholesaleThreshold) * 100));

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      error('Tu carrito está vacío. Agrega productos antes de enviar el pedido.');
      return;
    }

    const hasPaused = items.some((i) => i.product.isPaused);
    if (hasPaused) {
      error('Tu pedido contiene artículos que actualmente se encuentran pausados o sin stock. Remuévelos antes de confirmar.');
      return;
    }

    if (!firstName.trim() || !lastName.trim() || !phone.trim()) {
      error('Por favor completa Nombre, Apellido y Teléfono de WhatsApp.');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderPayload = {
        customer: {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          phone: phone.trim(),
          businessName: businessName.trim() || undefined
        },
        items: items.map((i) => ({
          productId: i.product._id,
          purchaseType: i.purchaseType,
          quantity: i.quantity
        }))
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al procesar el pedido.');
      }

      success(`¡Pedido ${data.order.orderNumber} registrado con éxito!`);
      clearCart();
      onClose();
      onOrderSuccess(data);
    } catch (err: any) {
      error(err.message || 'Ocurrió un error al enviar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Body */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-[#fbf9f8]">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-extrabold text-[#c62828] leading-tight">Mi Pedido</h2>
            <span className="text-xs uppercase font-bold text-gray-500 tracking-wider">
              {totalItems} {totalItems === 1 ? 'artículo seleccionado' : 'artículos seleccionados'}
            </span>
          </div>
          {items.length > 0 ? (
            <button
              onClick={() => {
                if (window.confirm('¿Deseas vaciar todos los artículos de tu pedido?')) {
                  clearCart();
                }
              }}
              className="text-xs font-semibold text-gray-500 hover:text-[#c62828] transition-colors"
            >
              Vaciar
            </button>
          ) : (
            <div className="w-9" />
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
              <ShoppingBag className="w-14 h-14 text-gray-300 mb-3" />
              <p className="text-lg font-bold text-gray-800">Tu carrito está vacío</p>
              <p className="text-sm text-gray-500 mt-1 max-w-xs">
                Navega por nuestro catálogo mayorista para sumar bultos al mejor precio de fábrica.
              </p>
            </div>
          ) : (
            <>
              {/* Wholesale Progress / Tier Banner */}
              <div className="relative overflow-hidden bg-[#f7f7f7] border border-gray-200 rounded-xl p-3.5 shadow-sm">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-extrabold text-sm text-[#c62828]">
                        {isGoalReached ? '¡Meta mayorista alcanzada!' : 'Beneficio Mayorista'}
                      </span>
                      {isGoalReached && (
                        <span className="bg-[#2e7d32] text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase">
                          Envío Bonificado
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      Monto sugerido: <strong className="text-gray-900">${minWholesaleThreshold.toLocaleString('es-AR')}</strong>.{' '}
                      {isGoalReached
                        ? 'Tu pedido califica para tarifas comerciales especiales y prioridad de despacho.'
                        : `Te faltan $${(minWholesaleThreshold - cartTotal).toLocaleString('es-AR')} para desbloquear flete directo.`}
                    </p>
                  </div>
                </div>

                {/* Progress track */}
                <div className="w-full h-2 bg-gray-200 rounded-full mt-3 overflow-hidden">
                  <div
                    className="h-full bg-[#c62828] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Itemized Cart List */}
              <div className="space-y-2.5">
                {items.map((item) => {
                  const isBulk = item.purchaseType === 'bulk';
                  const unitPrice = isBulk ? item.product.priceBulk : item.product.priceUnit;
                  const itemSubtotal = unitPrice * item.quantity;
                  const bulkUnits = item.product.unitsPerBulk || 12;

                  return (
                    <div
                      key={`${item.product._id}-${item.purchaseType}`}
                      className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-xl shadow-sm"
                    >
                      <img
                        src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                        alt={item.product.title}
                        className="w-16 h-16 object-contain bg-[#f9f9f9] rounded-lg p-1 border border-gray-100 flex-shrink-0"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-sm text-gray-900 truncate">
                            {item.product.title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product._id, item.purchaseType)}
                            className="text-gray-400 hover:text-[#c62828] p-0.5 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              isBulk ? 'bg-[#c62828] text-white' : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {isBulk ? `Bulto x${bulkUnits}` : 'Unidad'}
                          </span>
                          {item.product.isPaused && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">
                              Pausado / Sin Stock
                            </span>
                          )}
                          <span className="text-xs text-gray-500 font-medium">
                            {isBulk
                              ? `${item.quantity} ${item.quantity === 1 ? 'Bulto' : 'Bultos'} (${item.quantity * bulkUnits} u.)`
                              : `${item.quantity} sueltas`}
                          </span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-extrabold text-sm text-[#c62828]">
                            ${itemSubtotal.toLocaleString('es-AR')}
                          </span>

                          <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.purchaseType, item.quantity - 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-white text-gray-700 font-bold hover:bg-gray-200 shadow-xs"
                            >
                              -
                            </button>
                            <span className="px-2 text-xs font-bold text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product._id, item.purchaseType, item.quantity + 1)}
                              className="w-6 h-6 flex items-center justify-center rounded bg-white text-gray-700 font-bold hover:bg-gray-200 shadow-xs"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Financial Breakdown */}
              <div className="bg-[#f7f7f7] border border-gray-100 rounded-xl p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal Unidades</span>
                  <span className="font-semibold text-gray-800">${subtotalUnits.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal Bultos Cerrados</span>
                  <span className="font-semibold text-gray-800">${subtotalBulks.toLocaleString('es-AR')}</span>
                </div>
                {wholesaleSavings > 0 && (
                  <div className="flex items-center justify-between text-[#2e7d32] font-semibold">
                    <span className="flex items-center gap-1">
                      <span>Descuento Mayorista Aplicado</span>
                    </span>
                    <span className="font-bold">-${wholesaleSavings.toLocaleString('es-AR')}</span>
                  </div>
                )}
                <div className="pt-2 border-t border-gray-200 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs uppercase font-extrabold text-gray-700 tracking-wider block">
                      Total Estimado
                    </span>
                    <span className="text-[11px] text-[#2e7d32] font-semibold">
                      Precios sin IVA discriminado
                    </span>
                  </div>
                  <span className="text-2xl font-black text-[#c62828]">
                    ${cartTotal.toLocaleString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Fast Customer Form */}
              <form onSubmit={handleSubmitOrder} className="bg-white border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-1.5 h-4 bg-[#c62828] rounded-full" />
                  <h3 className="font-extrabold text-sm text-[#c62828]">Datos para tu pedido</h3>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-600 mb-1">
                      Nombre *
                    </label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Ej: Gonzalo"
                      className="w-full h-10 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase font-bold text-gray-600 mb-1">
                      Apellido *
                    </label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej: Martínez"
                      className="w-full h-10 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-bold text-gray-600 mb-1">
                    Teléfono Celular (WhatsApp) *
                  </label>
                  <div className="flex items-center bg-[#f7f7f7] border border-gray-200 rounded-lg focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c62828] overflow-hidden">
                    <span className="p-2.5 text-xs font-bold text-gray-500 bg-gray-200/60 w-15">
                      +54 9
                    </span>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="11 4598 2210"
                      className="w-full h-10 px-3 text-sm text-gray-900 bg-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs uppercase font-bold text-gray-600">
                      Nombre del Comercio / Kiosco
                    </label>
                    <span className="text-[11px] text-gray-400">Opcional</span>
                  </div>
                  <div className="flex items-center bg-[#f7f7f7] border border-gray-200 rounded-lg px-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c62828]">
                    <Store className="w-4 h-4 text-gray-400 mr-2" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej: Maxikiosco Central"
                      className="w-full h-10 text-sm text-gray-900 bg-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Dispatch info box */}
                <div className="flex items-center gap-2 p-2.5 bg-[#f7f7f7] rounded-lg text-xs text-gray-600">
                  <Truck className="w-4 h-4 text-[#c62828] flex-shrink-0" />
                  <span>Despacho en 24hs hábiles tras confirmar pago y disponibilidad.</span>
                </div>

                {/* Submit button inside form or sticky bottom */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-12 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <span>Generando pedido...</span>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="uppercase tracking-wide text-sm font-extrabold">
                          Enviar Pedido a WhatsApp
                        </span>
                      </>
                    )}
                  </button>
                  <p className="text-[11px] text-center text-gray-500 mt-2 leading-tight">
                    Se guardará tu pedido con código único y se abrirá el chat oficial con la distribuidora.
                  </p>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
