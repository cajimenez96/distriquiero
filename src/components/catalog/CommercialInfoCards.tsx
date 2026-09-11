import React from 'react';
import { Truck, Send, ShieldCheck, CreditCard } from 'lucide-react';

export const CommercialInfoCards: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
      {/* Card 1: Conditions / Minimum Order */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-gray-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#c62828]" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">
              Condiciones Mayoristas & Facturación
            </span>
          </div>
          <p className="text-xs sm:text-base font-black text-gray-900 tracking-tight">
            Monto mínimo sugerido para flete: <span className="text-[#c62828]">$50.000</span>
          </p>
        </div>
        <div className="hidden sm:flex shrink-0 w-10 h-10 rounded-xl bg-red-50 text-[#c62828] items-center justify-center font-bold text-xs">
          <ShieldCheck className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Direct WhatsApp Advice & Delivery */}
      <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex items-center justify-between gap-4 transition-all hover:border-gray-300">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#25D366]" />
            <span className="text-xs sm:text-sm font-bold text-gray-700">
              Despacho Directo en Bulto Cerrado
            </span>
          </div>
          <p className="text-xs sm:text-base font-black text-gray-900 tracking-tight">
            Atención personalizada y coordinación por <span className="text-[#25D366]">WhatsApp</span>
          </p>
        </div>
        <a
          href="https://wa.me/5491138291002?text=Hola%20DistriQuiero,%20quiero%20consultar%20por%20la%20lista%20de%20precios%20mayorista."
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 h-9 sm:h-10 px-3 sm:px-4 bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden xs:inline">Consultar</span>
        </a>
      </div>
    </div>
  );
};
