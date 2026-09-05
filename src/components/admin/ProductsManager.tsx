import React, { useState, useEffect } from 'react';
import { Plus, Search, Eye, EyeOff, Edit3, Trash2, Box, Sparkles, Tag, Check } from 'lucide-react';
import { Product } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../ui/Toast.tsx';
import { ProductDrawer } from './ProductDrawer.tsx';

export const ProductsManager: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const fetchProducts = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (err) {
      error('Error al cargar catálogo de productos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [token]);

  const handleTogglePause = async (product: Product) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/products/${product._id}/pause`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isPaused: !product.isPaused })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al actualizar estado.');
      }

      setProducts((prev) =>
        prev.map((p) => (p._id === product._id ? data.product : p))
      );
      success(data.product.isPaused ? 'Producto pausado (oculto del catálogo)' : 'Producto activado en catálogo');
    } catch (err: any) {
      error(err.message || 'No se pudo cambiar estado.');
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    if (!token) return;
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${product.title}"? Esta acción será auditada.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products/${product._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar producto.');
      }

      setProducts((prev) => prev.filter((p) => p._id !== product._id));
      success('Producto eliminado del sistema.');
    } catch (err: any) {
      error(err.message || 'No se pudo eliminar el producto.');
    }
  };

  const filteredProducts = products.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.sku?.toLowerCase().includes(search.toLowerCase()) ||
      p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Box className="w-5 h-5 text-[#c62828]" />
            <h2 className="text-xl font-extrabold text-gray-900">Gestión de Catálogo & Precios</h2>
          </div>
          <p className="text-xs text-gray-500">
            Administra precios por bulto, unidades mínimas, ofertas mayoristas y disponibilidad pública.
          </p>
        </div>

        <button
          onClick={() => {
            setSelectedProduct(null);
            setIsDrawerOpen(true);
          }}
          className="px-4 py-2.5 bg-[#c62828] hover:bg-[#a20513] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto Mayorista</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, marca o código SKU..."
            className="w-full h-10 pl-9 pr-3 text-xs bg-[#f7f7f7] border border-gray-200 rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-[#c62828]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Almacén', 'Bebidas', 'Golosinas', 'Limpieza', 'Snacks'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#c62828] text-white shadow-xs'
                  : 'bg-[#f7f7f7] text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat === 'all' ? 'Todas las Categorías' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm">Cargando inventario comercial...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">
            No se encontraron productos con los criterios especificados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f5f5] text-gray-600 font-extrabold uppercase border-b border-gray-200">
                  <th className="py-3.5 px-4">Producto / Marca</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Precio Sug. Unidad</th>
                  <th className="py-3.5 px-4">Bulto Cerrado</th>
                  <th className="py-3.5 px-4">Unid. / Bulto</th>
                  <th className="py-3.5 px-4">Estado Catálogo</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((product) => {
                  const hasOffer = product.isOffer;
                  const isPaused = product.isPaused;

                  return (
                    <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                      {/* Product details */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.images?.[0] || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=120'}
                            alt={product.title}
                            className="w-12 h-12 rounded-lg object-contain bg-[#f9f9f9] p-1 border border-gray-200 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900 truncate block max-w-xs">
                                {product.title}
                              </span>
                              {hasOffer && (
                                <span className="bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] text-[10px] font-black px-1.5 py-0.2 rounded">
                                  OFERTA
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-gray-400 font-semibold block">
                              {product.brand || 'Distribuidora'} • SKU: {product.sku || 'DQ-GEN'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4 text-gray-700 font-semibold whitespace-nowrap">
                        {product.category}
                      </td>

                      {/* Unit Price */}
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-gray-800">
                        ${product.priceUnit.toLocaleString('es-AR')}
                      </td>

                      {/* Bulk Price */}
                      <td className="py-3 px-4 whitespace-nowrap font-black text-[#c62828] text-sm">
                        ${product.priceBulk.toLocaleString('es-AR')}
                      </td>

                      {/* Units per pack */}
                      <td className="py-3 px-4 whitespace-nowrap text-gray-700 font-mono font-bold">
                        {product.unitsPerBulk || 12} u.
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() => handleTogglePause(product)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider transition-all active:scale-95 ${
                            isPaused
                              ? 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                              : 'bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] hover:bg-[#c8e6c9]'
                          }`}
                          title="Click para alternar visibilidad en catálogo público"
                        >
                          {isPaused ? (
                            <>
                              <EyeOff className="w-3.5 h-3.5" />
                              <span>Pausado</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-3.5 h-3.5" />
                              <span>Activo</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => {
                              setSelectedProduct(product);
                              setIsDrawerOpen(true);
                            }}
                            className="p-1.5 text-gray-600 hover:text-black hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar producto"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(product)}
                            className="p-1.5 text-gray-400 hover:text-[#c62828] hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 bg-[#fbf9f8] border-t border-gray-200 text-xs text-gray-500 flex items-center justify-between">
          <span>Total de productos en base: {products.length}</span>
          <span className="font-semibold text-gray-700">Precios actualizados en tiempo real</span>
        </div>
      </div>

      {/* Product Drawer */}
      <ProductDrawer
        product={selectedProduct}
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSaved={(updated) => {
          fetchProducts();
        }}
      />
    </div>
  );
};
