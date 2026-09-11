import React, { useState, useEffect } from 'react';
import { X, Save, Upload, Eye, EyeOff, ShieldCheck, Box, Tag, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Product, Category } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../ui/Toast.tsx';

interface ProductDrawerProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (product: Product) => void;
}

export const ProductDrawer: React.FC<ProductDrawerProps> = ({
  product,
  isOpen,
  onClose,
  onSaved
}) => {
  const { token, user } = useAuth();
  const { success, error } = useToast();

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [sku, setSku] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Golosinas');
  const [description, setDescription] = useState('');
  const [priceUnit, setPriceUnit] = useState<number>(1200);
  const [priceBulk, setPriceBulk] = useState<number>(12000);
  const [unitsPerBulk, setUnitsPerBulk] = useState<number>(12);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isOffer, setIsOffer] = useState<boolean>(false);
  const [images, setImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    fetch('/api/catalog/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setCategories(data.categories);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (product) {
      setTitle(product.title || '');
      setSku(product.sku || '');
      setBrand(product.brand || '');
      setCategory(product.category || 'Golosinas');
      setDescription(product.description || '');
      setPriceUnit(product.priceUnit || 0);
      setPriceBulk(product.priceBulk || 0);
      setUnitsPerBulk(product.unitsPerBulk || 12);
      setIsPaused(!!product.isPaused);
      setIsOffer(!!product.isOffer);
      setImages(product.images || []);
    } else {
      setTitle('');
      setSku(`DQ-${Math.random().toString(36).substring(2, 6).toUpperCase()}`);
      setBrand('');
      setCategory('Almacén');
      setDescription('');
      setPriceUnit(1000);
      setPriceBulk(10000);
      setUnitsPerBulk(12);
      setIsPaused(false);
      setIsOffer(false);
      setImages([]);
    }
  }, [product, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File) => {
    if (!token) return;
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir imagen a ImageKit');
      }

      setImages([data.url, ...images]);
      success('Imagen subida exitosamente a ImageKit.');
    } catch (err: any) {
      error(err.message || 'Error en la subida.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      error('El nombre del producto es obligatorio.');
      return;
    }

    const totalUnitCost = Number(priceUnit) * Number(unitsPerBulk);
    if (Number(priceBulk) > totalUnitCost) {
      error(`Inconsistencia de precios: El precio por bulto ($${priceBulk}) no puede ser mayor que comprar ${unitsPerBulk} unidades sueltas ($${totalUnitCost}). Debe representar un beneficio mayorista.`);
      return;
    }

    setIsSaving(true);

    try {
      const payload = {
        title: title.trim(),
        sku: sku.trim(),
        brand: brand.trim(),
        category: category.trim(),
        description: description.trim(),
        priceUnit: Number(priceUnit),
        priceBulk: Number(priceBulk),
        unitsPerBulk: Number(unitsPerBulk),
        isPaused,
        isOffer,
        images
      };

      const url = product?._id ? `/api/admin/products/${product._id}` : '/api/admin/products';
      const method = product?._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar el producto.');
      }

      success(`Producto ${product ? 'actualizado' : 'creado'} y auditado exitosamente.`);
      onSaved(data.product);
      onClose();
    } catch (err: any) {
      error(err.message || 'Error al guardar producto.');
    } finally {
      setIsSaving(false);
    }
  };

  const primaryImage = images[0] || 'https://lh3.googleusercontent.com/aida-public/AB6AXuACHW-TFAXq2hk15NnHLXPboHg5but-Xn8FUeNUz-Y5SXSoemR3CZfRAY-sLgOVN5t58htPr6XAUnoCtcgnS28wAhamugpO0oOL7OlpHC8iNqjnbbhTL-z4RW5gcRPfp6CMvrp50wy31kHPTbVMJAtWlhvrSA7i3bJ5Q3ZgBnKGi1N-c3mrXe3vDdaWOCSnrZm0-ZfOBh9wo-FWAE0q9tz4HxDFRo4MPKAD27nU2DW4uHqD7WSc6Gvnrg';

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="px-6 py-4 bg-[#fbf9f8] border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#c62828] flex items-center justify-center text-white">
              <Box className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-[#c62828]">
                {product ? 'Editar Producto / Precio Mayorista' : 'Nuevo Producto Mayorista'}
              </h2>
              <span className="text-xs text-gray-500 font-bold">SKU: {sku || 'AUTO'}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Status Switch Banner */}
          <div className="flex items-center justify-between p-3.5 bg-[#e8f5e9]/50 border border-[#c8e6c9] rounded-xl">
            <div className="flex items-center gap-2.5">
              {isPaused ? (
                <EyeOff className="w-5 h-5 text-gray-400" />
              ) : (
                <Eye className="w-5 h-5 text-[#2e7d32]" />
              )}
              <div>
                <span className="text-xs font-bold text-gray-900 block">
                  {isPaused ? 'Producto Pausado (Oculto)' : 'Producto Activo'}
                </span>
                <span className="text-[11px] text-gray-500">
                  {isPaused ? 'No visible en catálogo público' : 'Visible en catálogo público y checkout WhatsApp'}
                </span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={!isPaused}
                onChange={(e) => setIsPaused(!e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2e7d32]" />
            </label>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
              Nombre del Producto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Galletitas Chocolinas 250g"
              className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
            />
          </div>

          {/* Category & Brand */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                Categoría *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Almacén">Almacén</option>
                    <option value="Bebidas">Bebidas</option>
                    <option value="Golosinas">Golosinas</option>
                    <option value="Limpieza">Limpieza</option>
                    <option value="Snacks">Snacks</option>
                  </>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Ej: Bagley"
                className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
              />
            </div>
          </div>

          {/* Wholesale Pricing Structure Bento */}
          <div className="bg-[#f7f7f7] border border-gray-200 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-1.5 text-[#c62828] font-bold text-xs uppercase tracking-wider">
              <Tag className="w-4 h-4" />
              <span>Estructura de Precios Mayorista</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Precio Unitario Sugerido ($)
                </label>
                <div className="relative flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <span className="pl-3 text-sm font-bold text-gray-400">$</span>
                  <input
                    type="number"
                    min="0"
                    value={priceUnit}
                    onChange={(e) => setPriceUnit(Number(e.target.value))}
                    className="w-full h-10 px-2 text-sm font-bold text-gray-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">
                  Precio Bulto Cerrado ($)
                </label>
                <div className="relative flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <span className="pl-3 text-sm font-bold text-[#c62828]">$</span>
                  <input
                    type="number"
                    min="0"
                    value={priceBulk}
                    onChange={(e) => setPriceBulk(Number(e.target.value))}
                    className="w-full h-10 px-2 text-sm font-black text-[#c62828] outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Unidades por Bulto Cerrado (Pack)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  value={unitsPerBulk}
                  onChange={(e) => setUnitsPerBulk(Math.max(1, Number(e.target.value)))}
                  className="w-24 h-10 px-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-center text-gray-800 outline-none"
                />
                <span className="text-xs text-gray-500">
                  unidades por caja matriz
                </span>
              </div>
            </div>

            {/* Price Consistency & Savings Indicator */}
            {priceUnit > 0 && unitsPerBulk > 0 && (
              <div>
                {priceBulk > priceUnit * unitsPerBulk ? (
                  <div className="flex items-start gap-2 p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-600 mt-0.5" />
                    <span>
                      Incongruencia: El bulto (${priceBulk}) supera la suma de unidades sueltas (${priceUnit * unitsPerBulk}). Ajustá los precios para ofrecer ahorro mayorista.
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                    <span>
                      Ahorro mayorista: {Math.round(((priceUnit * unitsPerBulk - priceBulk) / (priceUnit * unitsPerBulk)) * 100)}% (${priceUnit * unitsPerBulk - priceBulk} de beneficio por bulto)
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Offer toggle */}
            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">¿Destacar como Oferta?</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isOffer}
                  onChange={(e) => setIsOffer(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#c62828]" />
              </label>
            </div>
          </div>

          {/* Image Upload Zone */}
          <div>
            <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
              Fotografía del Producto (ImageKit CDN)
            </label>
            <div className="flex items-center gap-3 p-3 bg-[#f7f7f7] border border-gray-200 rounded-xl">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-gray-200 p-1 flex-shrink-0 flex items-center justify-center">
                <img src={primaryImage} alt="Preview" className="w-full h-full object-contain" />
              </div>
              <div className="flex-1">
                <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm cursor-pointer active:scale-95 transition-all">
                  <Upload className="w-3.5 h-3.5" />
                  <span>{isUploading ? 'Subiendo...' : 'Reemplazar Foto'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileUpload(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1 leading-tight">
                  Formatos JPG o WebP con fondo blanco o neutro para catálogo comercial.
                </p>
              </div>
            </div>
          </div>

          {/* Audit footnote */}
          <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-2 text-xs text-gray-500">
            <ShieldCheck className="w-4 h-4 text-gray-400" />
            <span>
              Usuario activo: <strong className="text-gray-800">{user?.name || 'Administrador'}</strong>
            </span>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 bg-[#fbf9f8] border-t border-gray-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSave}
            className="px-5 py-2 rounded-lg bg-[#c62828] hover:bg-[#a20513] text-white text-sm font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
