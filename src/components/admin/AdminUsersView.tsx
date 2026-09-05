import React, { useState, useEffect } from 'react';
import { ShieldAlert, UserPlus, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { User as UserType } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../ui/Toast.tsx';

export const AdminUsersView: React.FC = () => {
  const { token, isSuperadmin } = useAuth();
  const { error, success } = useToast();

  const [users, setUsers] = useState<UserType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'superadmin'>('admin');
  const [isSaving, setIsSaving] = useState(false);

  const fetchUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (err) {
      error('Error al cargar la lista de administradores.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsSaving(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, password, role })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo crear el usuario.');
      }

      success(`Administrador ${data.user.name} registrado con éxito.`);
      setName('');
      setEmail('');
      setPassword('');
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      error(err.message || 'Error al guardar.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isSuperadmin) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center">
        <ShieldAlert className="w-12 h-12 text-[#c62828] mx-auto mb-3" />
        <h3 className="text-lg font-bold text-gray-900">Sección Exclusiva para Superadministrador</h3>
        <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
          No cuentas con los permisos requeridos para gestionar las cuentas de operador o supervisar credenciales maestras.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-5 h-5 text-[#c62828]" />
            <h2 className="text-xl font-extrabold text-gray-900">Administradores y Operaciones</h2>
          </div>
          <p className="text-xs text-gray-500">
            Control de accesos y roles con privilegios de gestión en DistriQuiero.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-[#c62828] hover:bg-[#a20513] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md active:scale-95 transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Nuevo Administrador</span>
        </button>
      </div>

      {/* Users List */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando administradores...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f5f5] text-gray-600 font-extrabold uppercase border-b border-gray-200">
                  <th className="py-3 px-4">Nombre</th>
                  <th className="py-3 px-4">Correo Electrónico</th>
                  <th className="py-3 px-4">Rol</th>
                  <th className="py-3 px-4">Estado</th>
                  <th className="py-3 px-4">Fecha de Alta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-[#ffebee] text-[#c62828] font-black text-xs flex items-center justify-center">
                        {u.name.charAt(0)}
                      </div>
                      <span>{u.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">{u.email}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          u.role === 'superadmin'
                            ? 'bg-[#ffebee] text-[#c62828] border border-[#ffcdd2]'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#2e7d32]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
                        Activo
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-500 font-mono">
                      {new Date(u.createdAt).toLocaleDateString('es-AR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-[#c62828]">Registrar Nuevo Operador</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1 rounded text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo *</label>
                <div className="relative flex items-center bg-[#f7f7f7] border border-gray-200 rounded-lg">
                  <User className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: Laura Gutiérrez"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                <div className="relative flex items-center bg-[#f7f7f7] border border-gray-200 rounded-lg">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="laura@distriquiero.com"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña Provisoria *</label>
                <div className="relative flex items-center bg-[#f7f7f7] border border-gray-200 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-400 absolute left-3" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full h-10 pl-9 pr-3 text-sm bg-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Nivel de Permisos (Rol)</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-10 px-3 bg-[#f7f7f7] border border-gray-200 rounded-lg text-sm text-gray-800 outline-none"
                >
                  <option value="admin">Admin (Gestión de Pedidos y Catálogo)</option>
                  <option value="superadmin">Superadmin (Acceso Completo y Auditoría)</option>
                </select>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#c62828] text-white rounded-lg text-xs font-bold shadow-md hover:bg-[#a20513] disabled:opacity-50"
                >
                  {isSaving ? 'Guardando...' : 'Crear Administrador'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
