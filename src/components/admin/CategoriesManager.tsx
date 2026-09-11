import React, { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Package,
  ArrowRight
} from 'lucide-react';
import { Category } from '../../types/index.ts';

export const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formName, setFormName] = useState<string>('');
  const [formOrder, setFormOrder] = useState<number>(0);
  const [formIsActive, setFormIsActive] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Delete modal states
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Load categories
  const loadCategories = async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('dq_auth_token');
      const res = await fetch('/api/admin/categories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        setErrorMessage(data.error || 'Error al cargar categorías.');
      }
    } catch (err: any) {
      setErrorMessage('Error de conexión al cargar categorías.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormName('');
    setFormOrder(categories.length + 1);
    setFormIsActive(true);
    setIsFormModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormName(cat.name);
    setFormOrder(cat.order || 0);
    setFormIsActive(cat.isActive !== false);
    setIsFormModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      const token = localStorage.getItem('dq_auth_token');
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory._id}`
        : '/api/admin/categories';
      const method = editingCategory ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: formName.trim(),
          order: Number(formOrder),
          isActive: formIsActive
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al guardar la categoría.');
      }

      setSuccessMessage(
        editingCategory ? 'Categoría actualizada exitosamente.' : 'Categoría creada exitosamente.'
      );
      setTimeout(() => setSuccessMessage(''), 4000);
      setIsFormModalOpen(false);
      await loadCategories();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openDeleteModal = (cat: Category) => {
    setDeletingCategory(cat);
    setReassignTargetId(''); // empty means default to "Sin categoría"
  };

  const handleConfirmDelete = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    setErrorMessage('');

    try {
      const token = localStorage.getItem('dq_auth_token');
      const res = await fetch(`/api/admin/categories/${deletingCategory._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reassignToCategoryId: reassignTargetId || undefined
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error al eliminar la categoría.');
      }

      setSuccessMessage(
        data.reassignedCount > 0
          ? `Categoría eliminada. Se reasignaron ${data.reassignedCount} producto(s) a "${data.targetCategory}".`
          : 'Categoría eliminada correctamente.'
      );
      setTimeout(() => setSuccessMessage(''), 5000);
      setDeletingCategory(null);
      await loadCategories();
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
            <Layers className="w-5 h-5 text-[#c62828]" />
            Gestión de Categorías
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Administrá las categorías del catálogo mayorista y orden de visualización.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="h-10 px-4 bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-2 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Categoría</span>
        </button>
      </div>

      {/* Status alerts */}
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

      {/* Table card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm flex flex-col items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#c62828]" />
            <span>Cargando categorías...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">
            No hay categorías registradas aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead className="bg-[#f7f5f4] text-gray-700 uppercase font-black tracking-wider text-[10px] border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Orden</th>
                  <th className="py-3.5 px-4">Nombre de Categoría</th>
                  <th className="py-3.5 px-4">Slug URL</th>
                  <th className="py-3.5 px-4 text-center">Productos</th>
                  <th className="py-3.5 px-4 text-center">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categories.map((cat) => {
                  const isProtected =
                    cat.name.toLowerCase() === 'sin categoría' || cat.slug === 'sin-categoria';

                  return (
                    <tr key={cat._id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-500">
                        #{cat.order || 0}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-extrabold text-gray-900 text-sm">{cat.name}</div>
                        {isProtected && (
                          <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-block mt-0.5">
                            Categoría de resguardo por defecto
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px]">{cat.slug}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-800">
                          <Package className="w-3 h-3 text-gray-500" />
                          {cat.productCount || 0}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                            cat.isActive !== false
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-gray-100 text-gray-500 border border-gray-200'
                          }`}
                        >
                          {cat.isActive !== false ? 'Activa' : 'Oculta'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(cat)}
                            className="p-1.5 text-gray-500 hover:text-[#c62828] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Editar categoría"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {!isProtected && (
                            <button
                              onClick={() => openDeleteModal(cat)}
                              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar categoría"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Category */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
              </h3>
              <button
                onClick={() => setIsFormModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-5 space-y-4">
              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                  Nombre de Categoría *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej: Lácteos & Frescos"
                  className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                />
                {editingCategory && (
                  <p className="text-[11px] text-amber-600 mt-1">
                    Nota: al modificar el nombre, se actualizará automáticamente en los{' '}
                    {editingCategory.productCount || 0} producto(s) asignados.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs uppercase font-extrabold text-gray-700 mb-1">
                  Orden de Visualización
                </label>
                <input
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  placeholder="1, 2, 3..."
                  className="w-full h-11 px-3 bg-[#f7f7f7] border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-[#c62828] outline-none"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="catIsActive"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-[#c62828] rounded border-gray-300 focus:ring-[#c62828]"
                />
                <label htmlFor="catIsActive" className="text-xs font-bold text-gray-800 select-none">
                  Visible en la tienda para los clientes
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formName.trim()}
                  className="px-5 py-2.5 bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCategory ? 'Guardar Cambios' : 'Crear Categoría'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Category & Reassign Products */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-red-50/50">
              <div className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-extrabold text-base">Eliminar Categoría</h3>
              </div>
              <button
                onClick={() => setDeletingCategory(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-gray-700 leading-relaxed">
                ¿Estás seguro de que querés eliminar la categoría{' '}
                <strong className="text-gray-900 font-extrabold">"{deletingCategory.name}"</strong>?
              </p>

              {deletingCategory.productCount && deletingCategory.productCount > 0 ? (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-xs font-bold text-amber-900">
                      Esta categoría tiene {deletingCategory.productCount} producto(s) asignados.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[11px] font-extrabold uppercase text-gray-700 mb-1">
                      ¿A qué categoría deseas reasignar estos productos?
                    </label>
                    <select
                      value={reassignTargetId}
                      onChange={(e) => setReassignTargetId(e.target.value)}
                      className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:ring-2 focus:ring-[#c62828] outline-none"
                    >
                      <option value="">Por defecto: Asignar a "Sin categoría"</option>
                      {categories
                        .filter(
                          (c) =>
                            c._id !== deletingCategory._id &&
                            c.name.toLowerCase() !== 'sin categoría'
                        )
                        .map((c) => (
                          <option key={c._id} value={c._id}>
                            Reasignar a: {c.name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-500">
                  Esta categoría no tiene productos asociados actualmente.
                </p>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setDeletingCategory(null)}
                  className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Confirmar Eliminación</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
