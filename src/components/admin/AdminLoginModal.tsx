import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, Headphones, Server } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useToast } from '../ui/Toast.tsx';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { login } = useAuth();
  const { error, success } = useToast();

  const [email, setEmail] = useState('admin@distriquiero.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      success('Acceso concedido al Panel de Operaciones');
      onSuccess();
    } else {
      error(result.error || 'Credenciales inválidas.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-7 flex flex-col items-center animate-in zoom-in-95 duration-200">
        {/* Top Terminal Status Pill */}
        {/* <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-[11px] font-bold uppercase tracking-wider mb-5">
          <span className="w-2 h-2 rounded-full bg-[#006d2f] animate-pulse" />
          <span>Terminal Corporativo V3.4 • Conexión Segura SSL</span>
        </div> */}

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-[#c62828] text-white rounded-xl flex items-center justify-center font-black text-xl mx-auto mb-2 shadow-md">
            DQ
          </div>
          <h2 className="text-2xl font-black text-[#c62828] tracking-tight">DistriQuiero</h2>
          <p className="text-xs text-gray-500 font-semibold mt-0.5">
            Acceso al Panel de Control Mayorista & FMCG
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
              <span>Correo electrónico / Usuario</span>
              <span className="text-gray-400 font-normal">Requerido</span>
            </div>
            <div className="relative flex items-center bg-[#f7f7f7] border border-gray-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c62828] transition-all">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@distriquiero.com"
                className="w-full h-11 pl-9 pr-3 text-sm text-gray-900 bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
              <span>Contraseña</span>
              <button
                type="button"
                onClick={() => alert('Para soporte de credenciales maestras, contacte al Superadministrador de Sistemas.')}
                className="text-xs text-[#c62828] hover:underline font-normal"
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>
            <div className="relative flex items-center bg-[#f7f7f7] border border-gray-200 rounded-xl focus-within:bg-white focus-within:ring-2 focus-within:ring-[#c62828] transition-all">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full h-11 pl-9 pr-10 text-sm text-gray-900 bg-transparent outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-400 hover:text-gray-700 p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-gray-600 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded text-[#c62828] focus:ring-[#c62828]"
              />
              <span>Recordar sesión en este equipo</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-12 bg-[#c62828] hover:bg-[#a20513] text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {isSubmitting ? (
              <span>Autenticando...</span>
            ) : (
              <>
                <span>Ingresar al Panel</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security badge */}
        {/* <div className="mt-5 w-full py-2.5 px-3 bg-[#f7f7f7] rounded-xl flex items-center justify-center gap-2 text-xs text-gray-500">
          <ShieldCheck className="w-4 h-4 text-gray-400" />
          <span>Protegido con verificación 2FA y cifrado de 256 bits</span>
        </div> */}

        {/* Footer info */}
        {/* <div className="mt-4 flex flex-col items-center gap-1 text-[11px] text-gray-400">
          <span className="flex items-center gap-1 hover:text-gray-600 cursor-pointer">
            <Headphones className="w-3.5 h-3.5" /> Soporte de Sistemas DistriQuiero
          </span>
          <span className="flex items-center gap-1.5 mt-0.5 text-gray-500">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2e7d32]" />
            <span>Servidor Operativo • Base de Datos Sincronizada</span>
          </span>
        </div> */}

        {/* Close action */}
        <button
          onClick={onClose}
          className="mt-3 text-xs text-gray-400 hover:text-gray-700 underline"
        >
          Volver a la tienda
        </button>
      </div>
    </div>
  );
};
