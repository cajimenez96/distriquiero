import React from 'react';
import { ShoppingBag, Box, Sparkles, Plus, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useToast } from '../ui/Toast.tsx';

interface ProductCardProps {
  product: Product;
  onOpenModal: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  const { addToCart } = useCart();
  const { success } = useToast();

  const bulkUnits = product.unitsPerBulk || 12;
  const unitPrice = product.priceUnit;
  const bulkPrice = product.priceBulk;

  // Wholesale calculations
  const retailEquivalent = unitPrice * bulkUnits;
  const bulkSavings = retailEquivalent > bulkPrice ? retailEquivalent - bulkPrice : 0;
  const bulkSavingsPercent = retailEquivalent > bulkPrice
    ? Math.round((bulkSavings / retailEquivalent) * 100)
    : 0;
  const perUnitInBulk = Math.round(bulkPrice / bulkUnits);

  const primaryImage = product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=500';

  const handleQuickAddBulk = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 'bulk', 1);
    success(`¡1 Bulto de ${product.title} sumado al pedido!`);
  };

  return (
    <div
      onClick={() => onOpenModal(product)}
      className="group relative bg-white border border-gray-200 rounded-2xl p-3 sm:p-4 flex flex-col justify-between hover:shadow-lg hover:border-[#c62828]/40 transition-all duration-200 cursor-pointer overflow-hidden"
    >
      <div>
        {/* Image Container with Badges */}
        <div className="relative w-full aspect-square bg-[#f9f9f9] rounded-xl overflow-hidden flex items-center justify-center p-3 mb-2.5 border border-gray-100 group-hover:scale-[1.02] transition-transform duration-200">
          <img
            src={primaryImage}
            alt={product.title}
            className="w-full h-full object-contain mix-blend-multiply"
            loading="lazy"
          />

          {/* Badges: Left (Pack size) & Right (Discount / Offer) */}
          <div className="absolute top-2 left-2">
            <span className="bg-gray-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs flex items-center gap-1">
              <Box className="w-3 h-3 text-gray-300" /> x{bulkUnits}
            </span>
          </div>

          {bulkSavingsPercent > 0 ? (
            <div className="absolute top-2 right-2 bg-[#25D366] text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
              -{bulkSavingsPercent}% OFF
            </div>
          ) : product.isOffer ? (
            <div className="absolute top-2 right-2 bg-[#e65100] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded shadow-xs uppercase">
              OFERTA
            </div>
          ) : null}
        </div>

        {/* Brand */}
        <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-0.5 truncate">
          {product.brand || 'Distribuidora'}
        </div>

        {/* Title */}
        <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem] group-hover:text-[#c62828] transition-colors">
          {product.title}
        </h3>
      </div>

      {/* Pricing & CTA Section */}
      <div className="mt-3 pt-2.5 border-t border-gray-100">
        {/* Main Price Bento */}
        <div className="bg-[#f8f9fa] rounded-xl p-2.5 mb-2.5">
          <div className="flex items-baseline justify-between gap-1">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-tight">
              Bulto cerrado
            </span>
            <span className="text-base sm:text-lg font-black text-[#c62828]">
              ${bulkPrice.toLocaleString('es-AR')}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-0.5 font-medium">
            <span>Por unidad en caja:</span>
            <span className="font-bold text-gray-700">
              ${perUnitInBulk.toLocaleString('es-AR')}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenModal(product);
            }}
            className="flex-1 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-colors text-center"
          >
            Ver más info
          </button>

          <button
            type="button"
            onClick={handleQuickAddBulk}
            title="Agregar 1 Bulto al pedido"
            className="h-9 px-3.5 rounded-xl bg-[#c62828] hover:bg-[#a20513] text-white flex items-center justify-center gap-1.5 text-xs font-bold shadow-xs active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Bulto</span>
          </button>
        </div>
      </div>
    </div>
  );
};
