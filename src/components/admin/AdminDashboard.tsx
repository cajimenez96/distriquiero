import React, { useState } from 'react';
import {
  Inbox,
  Box,
  History,
  Users,
  LogOut,
  ArrowLeft,
  ShieldCheck,
  Store,
  Bell,
  Layers,
  Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { OrdersTable } from './OrdersTable.tsx';
import { ProductsManager } from './ProductsManager.tsx';
import { AuditLogsView } from './AuditLogsView.tsx';
import { AdminUsersView } from './AdminUsersView.tsx';
import { CategoriesManager } from './CategoriesManager.tsx';
import { BannersManager } from './BannersManager.tsx';

interface AdminDashboardProps {
  onBackToStore: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onBackToStore }) => {
  const { user, logout, isSuperadmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'orders' | 'products' | 'categories' | 'banners' | 'audit' | 'users'>('orders');

  return (
    <div className="min-h-screen bg-[#f7f5f4] text-[#333333] flex flex-col font-sans">
      {/* Top Corporate Navigation */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand & Context */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToStore}
              className="p-2 rounded-xl text-gray-400 hover:text-black hover:bg-gray-100 transition-colors"
              title="Volver a la vista del cliente"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#c62828] text-white rounded-lg flex items-center justify-center font-black text-sm shadow-xs">
                DQ
              </div>
              <div>
                <span className="font-extrabold text-sm sm:text-base text-gray-900 block leading-none">
                  DistriQuiero Backoffice
                </span>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  Panel de Control Mayorista
                </span>
              </div>
            </div>
          </div>

          {/* User Profile & Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-[#f5f5f5] px-3 py-1.5 rounded-xl border border-gray-200">
              <div className="w-6 h-6 rounded-full bg-[#c62828] text-white font-bold text-xs flex items-center justify-center">
                {user?.name.charAt(0) || 'A'}
              </div>
              <div className="text-left">
                <span className="text-xs font-bold text-gray-800 block leading-tight">
                  {user?.name || 'Administrador'}
                </span>
                <span className="text-[10px] uppercase font-mono font-bold text-gray-400 block">
                  {user?.role || 'admin'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                logout();
                onBackToStore();
              }}
              className="p-2 text-gray-500 hover:text-[#c62828] hover:bg-red-50 rounded-xl transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-2 overflow-x-auto border-t border-gray-100 py-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-[#c62828] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Inbox className="w-4 h-4" />
            <span>Bandeja de Pedidos</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'products'
                ? 'bg-[#c62828] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Box className="w-4 h-4" />
            <span>Catálogo & Precios</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'categories'
                ? 'bg-[#c62828] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Categorías</span>
          </button>

          <button
            onClick={() => setActiveTab('banners')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'banners'
                ? 'bg-[#c62828] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Image className="w-4 h-4" />
            <span>Banners & Promos</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'audit'
                ? 'bg-[#c62828] text-white shadow-xs'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Auditoría de Cambios</span>
          </button>

          {isSuperadmin && (
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === 'users'
                  ? 'bg-[#c62828] text-white shadow-xs'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Usuarios & Roles</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Tab View */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
        {activeTab === 'orders' && <OrdersTable />}
        {activeTab === 'products' && <ProductsManager />}
        {activeTab === 'categories' && <CategoriesManager />}
        {activeTab === 'banners' && <BannersManager />}
        {activeTab === 'audit' && <AuditLogsView />}
        {activeTab === 'users' && isSuperadmin && <AdminUsersView />}
      </main>
    </div>
  );
};
