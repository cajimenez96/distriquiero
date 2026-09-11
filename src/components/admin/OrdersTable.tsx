import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle2,
  DollarSign,
  Phone,
  Send,
  Eye,
  Copy,
  Check,
  Calendar,
  Layers,
  Sparkles,
  TrendingUp,
  Box,
} from "lucide-react";
import { Order, OrderStatus } from "../../types/index.ts";
import { useAuth } from "../../context/AuthContext.tsx";
import { useToast } from "../ui/Toast.tsx";
import { OrderDetailModal } from "./OrderDetailModal.tsx";

export const OrdersTable: React.FC = () => {
  const { token } = useAuth();
  const { success, error } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<"all" | "Solicitado" | "Contestado">(
    "all",
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchOrders = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => null);
        throw new Error(
          errJson?.error ||
            `Error ${res.status}: no se pudieron obtener los pedidos.`,
        );
      }
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      error(err.message || "Error al sincronizar pedidos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const handleStatusToggle = async (
    orderId: string,
    newStatus: OrderStatus,
  ) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Error al actualizar estado.");
      }

      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? data.order : o)),
      );

      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(data.order);
      }

      success(`Pedido marcado como ${newStatus}`);
    } catch (err: any) {
      error(err.message || "No se pudo cambiar el estado.");
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Metrics calculation
  const totalSolicitados = orders.filter(
    (o) => o.status === "Solicitado",
  ).length;
  const totalContestados = orders.filter(
    (o) => o.status === "Contestado",
  ).length;
  const totalVentas = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const totalBulks = orders.reduce(
    (sum, o) =>
      sum +
      o.items
        .filter((i) => i.purchaseType === "bulk")
        .reduce((acc, i) => acc + i.quantity, 0),
    0,
  );

  const filteredOrders = orders.filter((o) => {
    if (filter === "all") return true;
    return o.status === filter;
  });

  return (
    <div className="space-y-5">
      {/* Executive Metric Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Solicitados */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider block">
              Solicitados
            </span>
            <span className="text-2xl font-black text-[#e65100] mt-0.5 block">
              {totalSolicitados} {totalSolicitados === 1 ? "Pedido" : "Pedidos"}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-[#e65100] animate-pulse" />
              Esperando confirmación comercial
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#fff3e0] text-[#e65100] flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Contestados */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider block">
              Contestados
            </span>
            <span className="text-2xl font-black text-[#2e7d32] mt-0.5 block">
              {totalContestados} {totalContestados === 1 ? "Pedido" : "Pedidos"}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#2e7d32]" />
              WhatsApp atendido y despachado
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#e8f5e9] text-[#2e7d32] flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        {/* Ventas del Día */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs uppercase font-extrabold text-gray-400 tracking-wider block">
              Ventas del Día
            </span>
            <span className="text-2xl font-black text-[#c62828] mt-0.5 block">
              ${totalVentas.toLocaleString("es-AR")}
            </span>
            <span className="text-[11px] text-gray-500 font-semibold flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#c62828]" />
              Facturación en trámite
            </span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#ffebee] text-[#c62828] flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Header Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 bg-[#f0f0f0] p-1 rounded-xl">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "all"
                ? "bg-white text-[#c62828] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilter("Solicitado")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "Solicitado"
                ? "bg-white text-[#e65100] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Solicitados ({totalSolicitados})
          </button>
          <button
            onClick={() => setFilter("Contestado")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              filter === "Contestado"
                ? "bg-white text-[#2e7d32] shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Contestados ({totalContestados})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f7f7f7] border border-gray-200 rounded-xl text-xs font-semibold text-gray-700">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            <span>
              Hoy:{" "}
              {new Date().toLocaleDateString("es-AR", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          <button
            onClick={fetchOrders}
            className="p-1.5 rounded-xl border border-gray-200 hover:bg-gray-100 text-gray-600 text-xs font-bold"
            title="Refrescar pedidos"
          >
            ↻
          </button>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400 text-sm">
            Sincronizando bandeja de pedidos mayoristas...
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-sm">
            No se encontraron pedidos en esta categoría.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#f5f5f5] text-gray-600 font-extrabold uppercase border-b border-gray-200">
                  <th className="py-3.5 px-4">ID Pedido</th>
                  <th className="py-3.5 px-4">Fecha / Hora</th>
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Teléfono / WhatsApp</th>
                  <th className="py-3.5 px-4">Modalidad & Detalle</th>
                  <th className="py-3.5 px-4">Total</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.map((order) => {
                  const isSolicitado = order.status === "Solicitado";
                  const bulks = order.items
                    .filter((i) => i.purchaseType === "bulk")
                    .reduce((a, i) => a + i.quantity, 0);
                  const units = order.items
                    .filter((i) => i.purchaseType === "unit")
                    .reduce((a, i) => a + i.quantity, 0);
                  const initials =
                    `${order.customer.firstName.charAt(0)}${order.customer.lastName.charAt(0)}`.toUpperCase();

                  const cleanPhone = order.customer.phone.replace(
                    /[^0-9]/g,
                    "",
                  );
                  const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                    `Hola ${order.customer.firstName}! Te escribimos de DistriQuiero sobre tu pedido ${order.orderNumber}.`,
                  )}`;

                  return (
                    <tr
                      key={order._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* ID */}
                      <td className="py-3 px-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{order.orderNumber}</span>
                          <button
                            onClick={() =>
                              copyToClipboard(order.orderNumber, order._id)
                            }
                            className="text-gray-400 hover:text-gray-700 p-0.5"
                            title="Copiar ID"
                          >
                            {copiedId === order._id ? (
                              <Check className="w-3.5 h-3.5 text-[#2e7d32]" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                        <div className="font-semibold text-gray-800">
                          {new Date(order.createdAt).toLocaleTimeString(
                            "es-AR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(order.createdAt).toLocaleDateString(
                            "es-AR",
                          )}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-[#ffebee] text-[#c62828] font-black text-xs flex items-center justify-center flex-shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <span className="font-bold text-gray-900 block truncate">
                              {order.customer.firstName}{" "}
                              {order.customer.lastName}
                            </span>
                            {order.customer.businessName && (
                              <span className="text-[11px] text-gray-500 block truncate">
                                {order.customer.businessName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 whitespace-nowrap font-mono text-gray-700">
                        {order.customer.phone}
                      </td>

                      {/* Breakdown */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {bulks > 0 && (
                            <span className="bg-[#ffebee] text-[#c62828] font-extrabold text-[10px] px-2 py-0.5 rounded">
                              {bulks} {bulks === 1 ? "Bulto" : "Bultos"}
                            </span>
                          )}
                          {units > 0 && (
                            <span className="bg-gray-100 text-gray-700 font-bold text-[10px] px-2 py-0.5 rounded">
                              {units} {units === 1 ? "Unidad" : "Unidades"}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-black text-[#c62828] whitespace-nowrap text-sm">
                        ${order.totalAmount.toLocaleString("es-AR")}
                      </td>

                      {/* State Toggle Chip */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <button
                          onClick={() =>
                            handleStatusToggle(
                              order._id,
                              isSolicitado ? "Contestado" : "Solicitado",
                            )
                          }
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider shadow-xs transition-all active:scale-95 ${
                            isSolicitado
                              ? "bg-[#fff3e0] text-[#e65100] border border-[#ffe0b2] hover:bg-[#ffe0b2]"
                              : "bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] hover:bg-[#c8e6c9]"
                          }`}
                          title="Click para cambiar estado"
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isSolicitado
                                ? "bg-[#e65100] animate-pulse"
                                : "bg-[#2e7d32]"
                            }`}
                          />
                          <span>{order.status}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-lg text-xs flex items-center gap-1 shadow-xs transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Detalle</span>
                          </button>

                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white rounded-lg shadow-xs transition-colors"
                            title="Chat WhatsApp directo con cliente"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </a>
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
          <span>
            Mostrando {filteredOrders.length} de {orders.length} pedidos
            mayoristas
          </span>
          <span className="font-semibold text-gray-700">
            Canal Directo de Despacho DistriQuiero
          </span>
        </div>
      </div>

      {/* Operational Insights Bento */}
      {/* <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <Box className="w-5 h-5 text-[#c62828]" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">
              Despacho por Bultos
            </span>
            <span className="text-lg font-black text-gray-900">{totalBulks} Bultos Cerrados</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <Clock className="w-5 h-5 text-[#2e7d32]" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">
              Tiempo Medio de Respuesta
            </span>
            <span className="text-lg font-black text-[#2e7d32]">4m 12s • Óptimo</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-700">
            <Sparkles className="w-5 h-5 text-[#e65100]" />
          </div>
          <div>
            <span className="text-xs text-gray-400 font-bold uppercase block">
              Tasa de Conversión WhatsApp
            </span>
            <span className="text-lg font-black text-gray-900">94.8% Cierre Directo</span>
          </div>
        </div>
      </div> */}

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onStatusChange={handleStatusToggle}
      />
    </div>
  );
};
