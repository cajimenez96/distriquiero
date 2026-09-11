import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, Flame, ArrowRight } from 'lucide-react';
import { Banner } from '../../types/index.ts';

interface BannerCarouselProps {
  banners: Banner[];
  onSelectCategory: (category: string) => void;
}

export const BannerCarousel: React.FC<BannerCarouselProps> = ({ banners, onSelectCategory }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeBanners = banners.filter(b => b.isActive);
  const hasBanners = activeBanners.length > 0;
  const count = hasBanners ? activeBanners.length : 1;

  // Auto-play cycle
  useEffect(() => {
    if (count <= 1 || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % count);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [count, isPaused]);

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex(prev => (prev + 1) % count);
  };

  const handleBannerClick = (banner?: Banner) => {
    if (!banner) {
      onSelectCategory('offers');
      return;
    }
    const cat = banner.targetCategory && banner.targetCategory !== 'todos' ? banner.targetCategory : 'all';
    onSelectCategory(cat);
  };

  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl shadow-md select-none group bg-gray-900"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides Container */}
      <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] min-h-[160px] sm:min-h-[220px] max-h-[360px]">
        {hasBanners ? (
          activeBanners.map((banner, idx) => (
            <div
              key={banner._id || idx}
              onClick={() => handleBannerClick(banner)}
              className={`absolute inset-0 w-full h-full cursor-pointer transition-opacity duration-700 ease-in-out ${
                idx === currentIndex ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={banner.imageUrl}
                alt={banner.title || 'Banner Promocional'}
                className="w-full h-full object-cover object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1600&q=80';
                }}
              />
              {/* Subtle gradient overlay to make text or badge legible if needed */}
              {banner.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 flex items-end justify-between gap-4">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#c62828] text-white mb-1 shadow-sm">
                      <Flame className="w-3 h-3 text-yellow-300" />
                      Promoción Activa
                    </span>
                    <h3 className="text-white font-black text-sm sm:text-xl md:text-2xl drop-shadow-sm line-clamp-1">
                      {banner.title}
                    </h3>
                  </div>
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-white/90 bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-xl">
                    Ver productos <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}
            </div>
          ))
        ) : (
          /* Institutional Fallback Hero Slide */
          <div
            onClick={() => handleBannerClick()}
            className="absolute inset-0 w-full h-full cursor-pointer bg-gradient-to-br from-[#ba1a1a] via-[#c62828] to-[#8c000f] text-white p-6 sm:p-10 flex flex-col justify-center"
          >
            <div className="max-w-2xl space-y-2 sm:space-y-3">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider text-white">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>Venta Directa de Fábrica</span>
              </div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                Abastecé tu comercio con bultos cerrados al mejor costo de plaza
              </h2>
              <p className="text-xs sm:text-sm text-white/90 font-medium max-w-lg line-clamp-2">
                Golosinas, alimentos secos, bebidas y limpieza para kioscos, almacenes y despensas.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Arrows (shown if > 1 slide) */}
      {count > 1 && (
        <>
          <button
            onClick={handlePrev}
            aria-label="Banner anterior"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md active:scale-90 opacity-80 hover:opacity-100"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleNext}
            aria-label="Siguiente banner"
            className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center transition-all shadow-md active:scale-90 opacity-80 hover:opacity-100"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Pagination */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2">
            {activeBanners.map((_, dotIdx) => (
              <button
                key={dotIdx}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(dotIdx);
                }}
                aria-label={`Ir al banner ${dotIdx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  dotIdx === currentIndex
                    ? 'w-6 bg-white shadow-sm'
                    : 'w-2 bg-white/50 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
