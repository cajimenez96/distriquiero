import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { ToastProvider } from './components/ui/Toast.tsx';
import { CatalogView } from './components/catalog/CatalogView.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';
import { AdminLoginModal } from './components/admin/AdminLoginModal.tsx';

function MainApp() {
  const { isAuthenticated, isLoading } = useAuth();
  const [view, setView] = useState<'catalog' | 'admin'>(() => {
    return window.location.hash.toLowerCase() === '#admin' ? 'admin' : 'catalog';
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Sync state with window.location.hash
  useEffect(() => {
    const handleHashChange = () => {
      const isHashAdmin = window.location.hash.toLowerCase() === '#admin';
      if (isHashAdmin) {
        if (!isLoading) {
          if (isAuthenticated) {
            setView('admin');
            setIsLoginModalOpen(false);
          } else {
            setView('catalog');
            setIsLoginModalOpen(true);
          }
        }
      } else {
        setView('catalog');
        setIsLoginModalOpen(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, isLoading]);

  const handleOpenAdmin = () => {
    if (isAuthenticated) {
      window.location.hash = '#admin';
      setView('admin');
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const handleBackToStore = () => {
    window.location.hash = '';
    setView('catalog');
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    window.location.hash = '#admin';
    setView('admin');
  };

  const handleCloseModal = () => {
    setIsLoginModalOpen(false);
    if (window.location.hash.toLowerCase() === '#admin' && !isAuthenticated) {
      window.location.hash = '';
    }
  };

  if (isLoading && window.location.hash.toLowerCase() === '#admin') {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#c62828] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Verificando sesión...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#333333]">
      {view === 'admin' && isAuthenticated ? (
        <AdminDashboard onBackToStore={handleBackToStore} />
      ) : (
        <CatalogView onOpenAdmin={handleOpenAdmin} />
      )}

      {/* Single source of truth for Admin Login Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <MainApp />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
