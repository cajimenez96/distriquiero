import React, { useState, useEffect } from 'react';
import { X, Check, ShoppingBag, ShieldCheck, Sparkles, Box, Layers } from 'lucide-react';
import { Product, PurchaseType } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useToast } from '../ui/Toast.tsx';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart } = useCart();
  const { success } = useToast();

  const [purchaseMode, setPurchaseMode] = useState<PurchaseType>('bulk');
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isAdded, setIsAdded] = useState<boolean>(false);

  useEffect(() => {
    if (product) {
      setPurchaseMode('bulk');
      setQuantity(product.isOffer ? 2 : 1);
      setSelectedImageIndex(0);
      setIsAdded(false);
    }
  }, [product]);

  if (!isOpen || !product) return null;

  const unitPrice = product.priceUnit;
  const bulkPrice = product.priceBulk;
  const bulkUnits = product.unitsPerBulk || 12;

  // Wholesale pricing comparison
  const retailEquivalentPerBulk = unitPrice * bulkUnits;
  const bulkSavingsPercent = retailEquivalentPerBulk > bulkPrice
    ? Math.round(((retailEquivalentPerBulk - bulkPrice) / retailEquivalentPerBulk) * 100)
    : 0;

  const currentPrice = purchaseMode === 'bulk' ? bulkPrice : unitPrice;
  const currentSubtotal = currentPrice * quantity;
  const currentTotalUnits = purchaseMode === 'bulk' ? quantity * bulkUnits : quantity;
  const totalSavings = purchaseMode === 'bulk' ? (retailEquivalentPerBulk - bulkPrice) * quantity : 0;
  const perUnitInBulk = Math.round(bulkPrice / bulkUnits);

  const images = product.images && product.images.length > 0
    ? product.images
    : ['https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80'];

  const handleAddToCart = () => {
    addToCart(product, purchaseMode, quantity);
    setIsAdded(true);
    success(`¡${quantity} ${purchaseMode === 'bulk' ? 'Bulto(s)' : 'Unidad(es)'} de ${product.title} añadido(s)!`);

    setTimeout(() => {
      setIsAdded(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal / Sheet Container */}
      <div className="relative w-full max-w-lg max-h-[90vh] sm:max-h-[85vh] bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-bottom duration-250">
        {/* Top Grabber (mobile) */}
        <div className="pt-2 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
        </div>

        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-bold tracking-wider text-gray-500">
              {product.brand || 'Distribuidora'} • SKU: {product.sku || 'DQ-GEN-01'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2e7d32] bg-[#e8f5e9] px-2 py-0.5 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" /> En Stock Directo
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#c62828] leading-tight">
            {product.title}
          </h2>

          {/* Main Visual Image */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#f9f9f9] border border-gray-100 flex items-center justify-center p-4">
            <img
              src={images[selectedImageIndex] || images[0]}
              alt={product.title}
              className="max-w-full max-h-full object-contain"
            />
            <div className="absolute top-3 left-3 bg-[#c62828] text-white px-2.5 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1">
              <Box className="w-3.5 h-3.5" /> Bulto Cerrado x{bulkUnits}
            </div>
            {product.isOffer && (
              <div className="absolute top-3 right-3 bg-[#e65100] text-white px-2 py-0.5 rounded-full text-[11px] font-extrabold shadow-sm">
                OFERTA MAYORISTA
              </div>
            )}
          </div>

          {/* Thumbnail strip if multiple images */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-14 h-14 rounded-lg p-1 border-2 transition-all flex-shrink-0 bg-white ${
                    selectedImageIndex === idx ? 'border-[#c62828] shadow-sm' : 'border-gray-200 opacity-60'
                  }`}
                >
                  <img src={img} alt={`Vista ${idx + 1}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Description & Distribution Details */}
          <div className="bg-[#f7f7f7] rounded-xl p-3.5 border border-gray-100">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-700 uppercase tracking-wide mb-1">
              <Box className="w-4 h-4 text-[#c62828]" />
              <span>Detalles de Distribución</span>
            </div>
            <p className="text-sm text-[#444444] leading-relaxed">
              {product.description ||
                'Pack cerrado de fábrica directo de distribuidora. Ideal para kioscos, minimarkets y despensas. Vencimiento prolongado garantizado.'}
            </p>
          </div>

          {/* Purchase Mode Selector (Segmented Control) */}
          <div>
            <label className="block text-sm font-bold text-[#222222] mb-2">
              Modalidad de compra
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#f0f0f0] p-1.5 rounded-xl">
              {/* Unit Mode */}
              <button
                type="button"
                onClick={() => {
                  setPurchaseMode('unit');
                  if (quantity < 1) setQuantity(1);
                }}
                className={`p-3 rounded-lg text-left transition-all ${
                  purchaseMode === 'unit'
                    ? 'bg-white text-[#c62828] shadow-md'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                <div className="text-xs font-semibold">Comprar por Unidad</div>
                <div className="text-lg font-bold mt-0.5">${unitPrice.toLocaleString('es-AR')}</div>
                <div className="text-[11px] text-gray-500">Precio al detalle</div>
              </button>

              {/* Bulk Mode */}
              <button
                type="button"
                onClick={() => {
                  setPurchaseMode('bulk');
                  if (quantity < 1) setQuantity(1);
                }}
                className={`p-3 rounded-lg text-left relative overflow-hidden transition-all ${
                  purchaseMode === 'bulk'
                    ? 'bg-white text-[#c62828] shadow-md ring-2 ring-[#c62828]/20'
                    : 'text-gray-600 hover:text-black'
                }`}
              >
                {bulkSavingsPercent > 0 && (
                  <span className="absolute top-1 right-1 bg-[#25D366] text-black font-extrabold text-[10px] px-1.5 py-0.5 rounded-full">
                    -{bulkSavingsPercent}% OFF
                  </span>
                )}
                <div className="text-xs font-bold flex items-center gap-1">
                  <span>Comprar por Bulto</span>
                </div>
                <div className="text-lg font-black text-[#c62828] mt-0.5">
                  ${bulkPrice.toLocaleString('es-AR')}
                </div>
                <div className="text-[11px] text-gray-600">
                  Bulto x{bulkUnits} un (${perUnitInBulk.toLocaleString('es-AR')} c/u)
                </div>
              </button>
            </div>
          </div>

          {/* Quantity Stepper & Calculation Card */}
          <div className="bg-[#f7f7f7] rounded-xl p-3.5 border border-gray-100 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
              <span>Cantidad a despachar</span>
              <span className="text-[#c62828] font-bold">
                {currentTotalUnits} {currentTotalUnits === 1 ? 'unidad total' : 'unidades totales'}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 pt-1">
              <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-200 p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold active:scale-95 transition-all"
                >
                  -
                </button>
                <div className="px-4 text-center font-bold text-sm min-w-[120px]">
                  {quantity} {purchaseMode === 'bulk' ? (quantity === 1 ? 'Bulto' : 'Bultos') : (quantity === 1 ? 'Unidad' : 'Unidades')}
                </div>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 flex items-center justify-center font-bold active:scale-95 transition-all"
                >
                  +
                </button>
              </div>

              <div className="text-right">
                <span className="block text-xs text-gray-500 font-medium">Subtotal</span>
                <span className="text-lg font-black text-[#c62828] block leading-tight">
                  ${currentSubtotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>
          </div>

          {/* Wholesale Savings Callout Banner */}
          {purchaseMode === 'bulk' && totalSavings > 0 && (
            <div className="bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] rounded-xl p-3.5 flex items-center gap-2.5">
              <Sparkles className="w-5 h-5 flex-shrink-0 text-[#2e7d32]" />
              <div className="text-xs">
                <p className="font-extrabold text-sm">
                  ¡Ahorrás ${totalSavings.toLocaleString('es-AR')} comprando por bulto cerrado!
                </p>
                <p className="opacity-90">Margen sugerido para reventa en mostrador: 35% - 40%</p>
              </div>
            </div>
          )}
        </div>

        {/* Sticky Conversion Footer */}
        <div className="p-4 bg-white border-t border-gray-100 shadow-lg">
          <button
            type="button"
            onClick={handleAddToCart}
            className={`w-full h-12 rounded-xl text-white font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98] ${
              isAdded ? 'bg-[#2e7d32]' : 'bg-[#c62828] hover:bg-[#b71c1c]'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-5 h-5" />
                <span>¡Agregado al pedido!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>Agregar al pedido • ${currentSubtotal.toLocaleString('es-AR')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
