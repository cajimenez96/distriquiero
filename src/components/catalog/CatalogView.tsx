import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Flame,
  Truck,
  ShieldCheck,
  Send,
  Lock,
  Store,
  Box,
  Layers,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { Product, OrderSubmissionResponse } from '../../types/index.ts';
import { useCart } from '../../context/CartContext.tsx';
import { useAuth } from '../../context/AuthContext.tsx';
import { ProductCard } from './ProductCard.tsx';
import { ProductDetailModal } from './ProductDetailModal.tsx';
import { CartDrawer } from '../cart/CartDrawer.tsx';
import { OrderConfirmationModal } from '../cart/OrderConfirmationModal.tsx';

interface CatalogViewProps {
  onOpenAdmin: () => void;
}

const CATEGORIES = [
  { id: 'all', label: 'Todas las Categorías', icon: Layers },
  { id: 'offers', label: '🔥 Ofertas Mayoristas', icon: Flame },
  { id: 'Almacén', label: 'Almacén', icon: Store },
  { id: 'Bebidas', label: 'Bebidas', icon: Box },
  { id: 'Golosinas', label: 'Golosinas', icon: Sparkles },
  { id: 'Limpieza', label: 'Limpieza', icon: ShieldCheck },
  { id: 'Snacks', label: 'Snacks', icon: Box }
];

export const CatalogView: React.FC<CatalogViewProps> = ({ onOpenAdmin }) => {
  const { totalItems, cartTotal } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Array<{ _id?: string; title: string; imageUrl: string; targetCategory?: string; isActive: boolean }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('relevance');

  // Modals state
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [orderConfirmation, setOrderConfirmation] = useState<OrderSubmissionResponse | null>(null);

  // Fetch catalog and banners from API
  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [catRes, banRes] = await Promise.all([
          fetch('/api/catalog'),
          fetch('/api/catalog/banners')
        ]);
        const catData = await catRes.json();
        if (catData.success) {
          setProducts(catData.products);
        }
        const banData = await banRes.json();
        if (banData.success && Array.isArray(banData.banners)) {
          setBanners(banData.banners);
        }
      } catch (e) {
        console.error('Error fetching catalog or banners:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  // Filtered and sorted products
  const displayedProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Exclude paused products from public view
        if (p.isPaused) return false;

        // Search match
        const query = searchQuery.toLowerCase().trim();
        const matchesQuery =
          !query ||
          p.title.toLowerCase().includes(query) ||
          p.brand?.toLowerCase().includes(query) ||
          p.sku?.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);

        // Category match
        let matchesCat = true;
        if (selectedCategory === 'offers') {
          matchesCat = !!p.isOffer;
        } else if (selectedCategory !== 'all') {
          matchesCat = p.category === selectedCategory;
        }

        return matchesQuery && matchesCat;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.priceBulk - b.priceBulk;
        if (sortBy === 'price-desc') return b.priceBulk - a.priceBulk;
        if (sortBy === 'savings') {
          const savingsA = a.priceUnit * a.unitsPerBulk - a.priceBulk;
          const savingsB = b.priceUnit * b.unitsPerBulk - b.priceBulk;
          return savingsB - savingsA;
        }
        return 0; // relevance / natural
      });
  }, [products, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="min-h-screen bg-white text-[#333333] flex flex-col selection:bg-[#c62828] selection:text-white">
      {/* Top Value Banner */}
      <div className="bg-[#1f1f1f] text-white text-[11px] sm:text-xs py-1.5 px-4 font-semibold text-center flex items-center justify-center gap-3">
        <span className="flex items-center gap-1">
          <Truck className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Despacho en 24/48hs a todo el país</span>
        </span>
        <span className="hidden md:inline">•</span>
        <span className="hidden md:flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[#25D366]" />
          <span>Venta Mayorista Oficial & Bultos Cerrados de Fábrica</span>
        </span>
        <span className="hidden sm:inline">•</span>
        <span className="text-[#25D366] font-bold">Monto mínimo sugerido para flete directo: $50.000</span>
      </div>

      {/* Main Commercial Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3 sm:gap-6">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-[#c62828] text-white rounded-xl flex items-center justify-center font-black text-xl shadow-sm tracking-tight">
                DQ
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-[#c62828] tracking-tight leading-none">
                  DistriQuiero
                </h1>
                <span className="text-[10px] sm:text-[11px] font-extrabold uppercase text-gray-400 tracking-wider">
                  Distribuidora Mayorista
                </span>
              </div>
            </div>
          </div>

          {/* Search Bar on Desktop */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar golosinas, bebidas, galletitas, marcas..."
              className="w-full h-10 pl-9 pr-4 text-xs sm:text-sm bg-[#f5f5f5] border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#c62828] transition-all"
            />
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Operator Portal button */}
            <button
              onClick={onOpenAdmin}
              className={`h-10 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                isAuthenticated
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'border-gray-200 hover:bg-gray-100 text-gray-600'
              }`}
              title={isAuthenticated ? `Sesión iniciada como ${user?.name || 'Admin'} - Ir al Panel` : 'Acceso al Panel de Administración'}
            >
              {isAuthenticated ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-gray-500" />
              )}
              <span className="hidden lg:inline">
                {isAuthenticated ? 'Panel Operaciones' : 'Acceso Operaciones'}
              </span>
            </button>

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative h-10 px-3 sm:px-4 rounded-xl bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold text-xs sm:text-sm flex items-center gap-2 shadow-sm active:scale-95 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Mi Pedido</span>
              {totalItems > 0 && (
                <span className="bg-white text-[#c62828] font-black text-xs px-2 py-0.5 rounded-full shadow-xs">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="px-4 pb-2.5 md:hidden">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar productos, marcas, SKU..."
              className="w-full h-10 pl-9 pr-3 text-xs bg-[#f5f5f5] border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#c62828]"
            />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-5 space-y-6">
        {/* Promotional Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#ba1a1a] via-[#c62828] to-[#8c000f] text-white p-6 sm:p-8 shadow-md">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white">
              <Flame className="w-3.5 h-3.5 text-yellow-300" />
              <span>Semana de Precios Mayoristas Directos</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
              Abastecé tu comercio con bultos cerrados al mejor costo de plaza
            </h2>

            <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-xl">
              Golosinas, alimentos secos, bebidas y limpieza para kioscos, almacenes y despensas.
              Cotización y coordinación inmediata por WhatsApp Business.
            </p>

            <div className="pt-2 flex items-center gap-3 flex-wrap">
              <button
                onClick={() => setSelectedCategory('offers')}
                className="h-10 px-5 bg-white text-[#c62828] font-black text-xs rounded-xl shadow-md hover:bg-gray-100 active:scale-95 transition-all flex items-center gap-1.5"
              >
                <Flame className="w-4 h-4 text-[#c62828]" />
                <span>Ver Ofertas Especiales</span>
              </button>

              <a
                href="https://wa.me/5491138291002?text=Hola%20DistriQuiero,%20quiero%20consultar%20por%20la%20lista%20de%20precios%20mayorista."
                target="_blank"
                rel="noopener noreferrer"
                className="h-10 px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Asesoría Comercial Directa</span>
              </a>
            </div>
          </div>

          {/* Decorative watermark icon */}
          <div className="absolute -right-8 -bottom-10 opacity-10 text-white pointer-events-none">
            <Store className="w-72 h-72" />
          </div>
        </div>

        {/* Dynamic Promotional Banners from Database */}
        {banners.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {banners.map((b) => (
              <div
                key={b._id || b.title}
                onClick={() => {
                  if (b.targetCategory && b.targetCategory !== 'todos' && b.targetCategory !== 'all') {
                    setSelectedCategory(b.targetCategory);
                  } else {
                    setSelectedCategory('offers');
                  }
                }}
                className="group relative cursor-pointer overflow-hidden rounded-2xl bg-gradient-to-r from-[#1f1f1f] to-[#2c2c2c] border border-gray-200/20 shadow-sm transition-all hover:shadow-md hover:border-[#c62828]"
              >
                <div className="flex items-center justify-between gap-4 p-4 text-white relative z-10">
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#c62828] text-[10px] font-black tracking-wider uppercase text-white">
                      <Flame className="w-3 h-3 text-yellow-300" />
                      Promo Activa
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight text-white truncate">{b.title}</h3>
                    <p className="text-xs text-gray-300 line-clamp-1">
                      Clic para ver productos de esta promo mayorista
                    </p>
                  </div>
                  {b.imageUrl && (
                    <div className="w-20 h-16 sm:w-28 sm:h-20 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                      <img
                        src={b.imageUrl}
                        alt={b.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-[#c62828] text-white border-[#c62828] shadow-sm'
                    : 'bg-[#f5f5f5] text-gray-700 border-gray-200 hover:bg-gray-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Filter Controls & Result Count */}
        <div className="flex items-center justify-between flex-wrap gap-3 pb-1 border-b border-gray-100">
          <div className="text-xs text-gray-500 font-semibold">
            Mostrando{' '}
            <strong className="text-gray-900 font-extrabold">
              {displayedProducts.length}
            </strong>{' '}
            artículos mayoristas disponibles
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 font-semibold flex items-center gap-1">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Ordenar:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8 px-2.5 bg-[#f5f5f5] border border-gray-200 rounded-lg text-xs font-bold text-gray-700 outline-none focus:ring-1 focus:ring-[#c62828]"
            >
              <option value="relevance">Relevancia</option>
              <option value="price-asc">Precio Bulto: Menor a Mayor</option>
              <option value="price-desc">Precio Bulto: Mayor a Menor</option>
              <option value="savings">Mayor Ahorro por Bulto</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="py-24 text-center">
            <div className="inline-block animate-spin w-8 h-8 border-4 border-[#c62828] border-t-transparent rounded-full mb-3" />
            <p className="text-sm font-bold text-gray-600">
              Cargando catálogo mayorista de DistriQuiero...
            </p>
          </div>
        ) : displayedProducts.length === 0 ? (
          <div className="py-20 text-center bg-[#f9f9f9] rounded-2xl border border-gray-200 p-8 space-y-3">
            <Store className="w-12 h-12 text-gray-300 mx-auto" />
            <h3 className="text-lg font-bold text-gray-800">No encontramos productos en esta búsqueda</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Intenta con otro término, marca o selecciona otra categoría para explorar todos los bultos disponibles.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="px-4 py-2 bg-[#c62828] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#a20513]"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                onOpenModal={(prod) => setActiveProduct(prod)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Floating Mobile Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full h-14 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-2xl shadow-2xl flex items-center justify-between px-4 font-black text-sm active:scale-98 transition-all"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-black/20 flex items-center justify-center text-xs">
                {totalItems}
              </div>
              <div className="text-left">
                <span className="block text-xs uppercase font-extrabold tracking-tight opacity-90">
                  Ver Pedido
                </span>
                <span className="block text-sm font-black leading-tight">
                  ${cartTotal.toLocaleString('es-AR')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider bg-black/20 px-3 py-1.5 rounded-xl">
              <span>Finalizar</span>
              <Send className="w-4 h-4" />
            </div>
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#f5f5f5] border-t border-gray-200 mt-16 py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm text-[#c62828]">DistriQuiero</span>
            <span>• Soluciones Mayoristas & FMCG</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Envíos a todo el país</span>
            <span>Atención comercial Lunes a Viernes 8 a 18hs</span>
          </div>

          <button
            onClick={onOpenAdmin}
            className="text-gray-400 hover:text-gray-700 font-semibold transition-colors"
          >
            Portal Administrador
          </button>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ProductDetailModal
        product={activeProduct}
        isOpen={!!activeProduct}
        onClose={() => setActiveProduct(null)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={(orderData) => {
          setOrderConfirmation(orderData);
        }}
      />

      <OrderConfirmationModal
        orderData={orderConfirmation}
        isOpen={!!orderConfirmation}
        onClose={() => setOrderConfirmation(null)}
      />

    </div>
  );
};
