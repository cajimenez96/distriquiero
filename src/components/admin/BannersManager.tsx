import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  Loader2,
  Upload,
  ExternalLink,
  Flame,
  ArrowUpDown
} from 'lucide-react';
import { Banner, Category } from '../../types/index.ts';

export const BannersManager: React.FC = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formTitle, setFormTitle] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  const [formTargetCategory, setFormTargetCategory] = useState<string>('all');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete modal
  const [deletingBanner, setDeletingBanner] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('dq_auth_token');
      const [banRes, catRes] = await Promise.all([
        fetch('/api/admin/banners', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/admin/categories', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      const banData = await banRes.json();
      const catData = await catRes.json();

      if (banData.success) setBanners(banData.banners);
      if (catData.success) setCategories(catData.categories);
    } catch (err: any) {
      setErrorMessage('Error al cargar datos de banners.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingBanner(null);
    setFormTitle('');
    setFormImageUrl('');
    setFormTargetCategory('all');
    setFormOrder(banners.length + 1);
    setFormIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (banner: Banner) => {
    setEditingBanner(banner);
    setFormTitle(banner.title || '');
    setFormImageUrl(banner.imageUrl || '');
    setFormTargetCategory(banner.targetCategory || 'all');
    setFormOrder(banner.order || 0);
    setFormIsActive(banner.isActive !== false);
    setIsModalOpen(true);
  };

  // Upload image to ImageKit via /api/admin/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('dq_auth_token');
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al subir la imagen.');
      }

      setFormImageUrl(data.url);
      setSuccessMessage('Imagen subida con éxito a ImageKit.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formImageUrl.trim()) {
      setErrorMessage('Debes ingresar o subir una imagen para el banner.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('dq_auth_token');
      const url = editingBanner
        ? `/api/admin/banners/${editingBanner._id}`
        : '/api/admin/banners';
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          title: formTitle.trim(),
          imageUrl: formImageUrl.trim(),
          targetCategory: formTargetCategory,
          order: Number(formOrder),
          isActive: formIsActive
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar el banner.');
      }

      setSuccessMessage(
        editingBanner ? 'Banner actualizado exitosamente.' : 'Banner creado exitosamente.'
      );
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsModalOpen(false);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBanner = async () => {
    if (!deletingBanner) return;
    setIsDeleting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('dq_auth_token');
      const res = await fetch(`/api/admin/banners/${deletingBanner._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar banner.');
      }

      setSuccessMessage('Banner eliminado correctamente.');
      setTimeout(() => setSuccessMessage(''), 4000);
      setDeletingBanner(null);
      await loadData();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center gap-2">
            <Image className="w-5 h-5 text-[#c62828]" />
            Banners Promocionales & Carrusel
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Gestioná los banners rotativos superiores del catálogo y sus categorías de destino.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-10 px-4 bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Banner</span>
        </button>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 font-bold flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage('')} className="p-1 hover:text-red-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 font-bold flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            {successMessage}
          </span>
          <button onClick={() => setSuccessMessage('')} className="p-1 hover:text-emerald-900">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Banners Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#c62828]" />
            <span>Cargando banners promocionales...</span>
          </div>
        ) : banners.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">
            No hay banners configurados. Agregá uno para que se muestre en el carrusel superior.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#f7f5f4] text-gray-700 uppercase font-black tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Orden</th>
                  <th className="py-3.5 px-4">Vista Previa</th>
                  <th className="py-3.5 px-4">Título Promocional</th>
                  <th className="py-3.5 px-4">Categoría Destino</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {banners.map((banner) => (
                  <tr key={banner._id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-gray-500">
                      #{banner.order || 0}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-12 rounded-lg overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        <img
                          src={banner.imageUrl}
                          alt={banner.title || 'Banner'}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 font-extrabold text-gray-900 text-sm">
                      {banner.title || <span className="text-gray-400 italic">Sin título</span>}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                        {banner.targetCategory === 'offers' ? (
                          <>
                            <Flame className="w-3 h-3 text-[#c62828]" />
                            Ofertas Mayoristas
                          </>
                        ) : banner.targetCategory === 'all' || banner.targetCategory === 'todos' ? (
                          'Todas las Categorías'
                        ) : (
                          banner.targetCategory
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                          banner.isActive !== false
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-gray-100 text-gray-500 border border-gray-200'
                        }`}
                      >
                        {banner.isActive !== false ? 'Activo' : 'Pausado'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(banner)}
                          className="p-1.5 text-gray-500 hover:text-[#c62828] hover:bg-gray-100 rounded-lg transition-colors"
                          title="Editar banner"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingBanner(banner)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Eliminar banner"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Banner */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingBanner ? 'Editar Banner' : 'Nuevo Banner Promocional'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-5 space-y-4">
              {/* Image Preview & Upload */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                  Imagen del Banner * (Recomendado: 1200x400 px)
                </label>

                {formImageUrl && (
                  <div className="relative w-full aspect-[21/9] rounded-xl overflow-hidden border border-gray-200 mb-2 bg-gray-900">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormImageUrl('')}
                      className="absolute top-2 right-2 p-1 bg-black/60 text-white rounded-lg hover:bg-black"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://... o subí un archivo"
                    className="flex-1 h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                  />
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={isUploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="h-11 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
                  >
                    {isUploading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#c62828]" />
                    ) : (
                      <Upload className="w-4 h-4" />
                    )}
                    <span>Subir</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                  Título Promocional (Opcional)
                </label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder="Ej: Súper Ofertas por Bulto Cerrado"
                  className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                />
              </div>

              {/* Target Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                    Categoría Destino
                  </label>
                  <select
                    value={formTargetCategory}
                    onChange={(e) => setFormTargetCategory(e.target.value)}
                    className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                  >
                    <option value="all">Todas las Categorías</option>
                    <option value="offers">🔥 Ofertas Mayoristas</option>
                    {categories.map((c) => (
                      <option key={c._id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                    Orden
                  </label>
                  <input
                    type="number"
                    value={formOrder}
                    onChange={(e) => setFormOrder(Number(e.target.value))}
                    className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                  />
                </div>
              </div>

              {/* Active Switch */}
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="bannerIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#c62828] rounded border-gray-300 focus:ring-[#c62828]"
                />
                <label htmlFor="bannerIsActive" className="text-xs font-bold text-gray-800 select-none">
                  Banner Activo (Visible en el carrusel de la tienda)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formImageUrl.trim()}
                  className="px-5 py-2.5 bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingBanner ? 'Guardar Cambios' : 'Crear Banner'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Banner */}
      {deletingBanner && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <h3 className="font-extrabold text-base text-red-700">Eliminar Banner</h3>
              <button
                onClick={() => setDeletingBanner(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-700">
                ¿Estás seguro de que deseas eliminar este banner del carrusel?
              </p>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeletingBanner(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleDeleteBanner}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Eliminar</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
