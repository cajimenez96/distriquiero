import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
  duration?: number;
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info', duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message, duration }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  const success = useCallback((msg: string) => toast(msg, 'success'), [toast]);
  const error = useCallback((msg: string) => toast(msg, 'error', 4000), [toast]);
  const info = useCallback((msg: string) => toast(msg, 'info'), [toast]);
  const contextValue = useMemo(
    () => ({ toast, success, error, info }),
    [toast, success, error, info]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-xl shadow-lg border text-sm transition-all duration-300 transform translate-y-0 ${
              t.type === 'success'
                ? 'bg-[#e8f5e9] border-[#c8e6c9] text-[#2e7d32]'
                : t.type === 'error'
                ? 'bg-[#ffebee] border-[#ffcdd2] text-[#c62828]'
                : 'bg-white border-[#e0e0e0] text-[#333333]'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-[#2e7d32]" />}
              {t.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0 text-[#c62828]" />}
              {t.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-[#1976d2]" />}
              <span className="font-semibold leading-tight">{t.message}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="p-1 text-gray-500 hover:text-black rounded-lg transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
