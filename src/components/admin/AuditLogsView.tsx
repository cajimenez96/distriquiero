import React, { useState, useEffect } from 'react';
import { History, Shield, Eye, ArrowRight, UserCheck } from 'lucide-react';
import { AuditLog } from '../../types/index.ts';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../ui/Toast.tsx';

export const AuditLogsView: React.FC = () => {
  const { token } = useAuth();
  const { error } = useToast();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSnapshot, setSelectedSnapshot] = useState<AuditLog | null>(null);

  useEffect(() => {
    async function fetchAuditLogs() {
      if (!token) return;
      setIsLoading(true);
      try {
        const res = await fetch('/api/admin/audit-logs?limit=50', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
          setLogs(data.logs);
        }
      } catch (err) {
        error('Error al cargar registros de auditoría.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchAuditLogs();
  }, [token, error]);

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE':
        return <span className="bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">CREATE</span>;
      case 'UPDATE':
        return <span className="bg-[#e3f2fd] text-[#1565c0] border border-[#bbdefb] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">UPDATE</span>;
      case 'DELETE':
        return <span className="bg-[#ffebee] text-[#c62828] border border-[#ffcdd2] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">DELETE</span>;
      case 'STATUS_CHANGE':
        return <span className="bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">STATUS</span>;
      case 'PAUSE':
        return <span className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase">PAUSE</span>;
      default:
        return <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">{action}</span>;
    }
  };

  return (
    <div className="space-y-4">
      {/* View Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-[#c62828]" />
            <h2 className="text-xl font-extrabold text-gray-900">Auditoría de Cambios del Sistema</h2>
          </div>
          <p className="text-xs text-gray-500">
            Registro inmutable de mutaciones, altas, bajas de productos, órdenes y usuarios con instantáneas JSON.
          </p>
        </div>
        <span className="text-xs font-bold text-[#c62828] bg-[#ffebee] px-3 py-1 rounded-full">
          {logs.length} Registros Activos
        </span>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Cargando trazas de auditoría...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">No se encontraron registros de auditoría.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f5f5] text-gray-600 font-extrabold uppercase border-b border-gray-200">
                  <th className="py-3 px-4">Fecha / Hora</th>
                  <th className="py-3 px-4">Usuario</th>
                  <th className="py-3 px-4">Acción</th>
                  <th className="py-3 px-4">Entidad</th>
                  <th className="py-3 px-4">ID Entidad</th>
                  <th className="py-3 px-4 text-right">Snapshots</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {logs.map((log) => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-gray-600">
                      {new Date(log.createdAt).toLocaleString('es-AR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-gray-900">{log.userName}</div>
                      <div className="text-[10px] text-gray-400 uppercase tracking-wider">{log.userRole}</div>
                    </td>
                    <td className="py-3 px-4">{getActionBadge(log.action)}</td>
                    <td className="py-3 px-4 font-semibold text-gray-700">{log.entity}</td>
                    <td className="py-3 px-4 font-mono text-gray-500">{log.entityId}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedSnapshot(log)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-bold text-[11px] shadow-xs active:scale-95 transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Ver JSON</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Snapshot Inspector Modal */}
      {selectedSnapshot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div>
                <h3 className="font-extrabold text-base text-[#c62828]">
                  Instantánea de Auditoría #{selectedSnapshot._id}
                </h3>
                <span className="text-xs text-gray-500">
                  {selectedSnapshot.action} sobre {selectedSnapshot.entity} ({selectedSnapshot.entityId})
                </span>
              </div>
              <button
                onClick={() => setSelectedSnapshot(null)}
                className="p-1 rounded-lg text-gray-400 hover:text-black hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 overflow-y-auto">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-600 mb-1">
                  beforeSnapshot (Estado previo)
                </span>
                <pre className="p-3 bg-gray-900 text-green-400 text-xs rounded-xl overflow-x-auto flex-1 font-mono">
                  {selectedSnapshot.beforeSnapshot
                    ? JSON.stringify(selectedSnapshot.beforeSnapshot, null, 2)
                    : '// null (Nuevo registro creado)'}
                </pre>
              </div>

              <div className="flex flex-col">
                <span className="text-xs font-bold text-gray-600 mb-1">
                  afterSnapshot (Estado posterior)
                </span>
                <pre className="p-3 bg-gray-900 text-blue-300 text-xs rounded-xl overflow-x-auto flex-1 font-mono">
                  {selectedSnapshot.afterSnapshot
                    ? JSON.stringify(selectedSnapshot.afterSnapshot, null, 2)
                    : '// null (Registro eliminado)'}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
