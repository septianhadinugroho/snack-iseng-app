import { useState, useRef } from 'react';
import { ChevronLeft } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [startY, setStartY] = useState(0);
  const containerRef = useRef(null);
  
  const threshold = 80; // Jarak minimal untuk trigger refresh
  const maxPull = 120; // Batas maksimal tarik

  const handleTouchStart = (e) => {
    // Only activate if scrolled to top
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY);
    }
  };

  const handleTouchMove = (e) => {
    if (startY === 0 || isRefreshing || window.scrollY > 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = Math.min(Math.max(currentY - startY, 0), maxPull);
    setPullDistance(distance);
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
    setStartY(0);
  };

  const progress = Math.min((pullDistance / threshold) * 100, 100);

  return (
    <div 
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center transition-all duration-300 overflow-hidden"
        style={{ 
          height: isRefreshing ? '60px' : `${pullDistance}px`,
          opacity: pullDistance > 0 ? 1 : 0
        }}
      >
        <div className="bg-gradient-to-b from-orange-50 to-white dark:from-gray-900 dark:to-gray-800 w-full h-full flex items-center justify-center">
          {isRefreshing ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">Memuat ulang...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <div className="relative w-8 h-8">
                {/* Progress Circle */}
                <svg className="transform -rotate-90 w-8 h-8">
                  <circle 
                    cx="16" cy="16" r="14" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none"
                    className="text-orange-200 dark:text-orange-900"
                  />
                  <circle 
                    cx="16" cy="16" r="14" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    fill="none"
                    strokeDasharray={`${2 * Math.PI * 14}`}
                    strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
                    className="text-orange-500 transition-all duration-150"
                  />
                </svg>
                {/* Arrow Icon */}
                <div 
                  className="absolute inset-0 flex items-center justify-center transition-transform duration-300"
                  style={{ transform: `rotate(${progress >= 100 ? 180 : 0}deg)` }}
                >
                  <ChevronLeft 
                    size={16} 
                    className="text-orange-600 dark:text-orange-400 transform rotate-90" 
                  />
                </div>
              </div>
              <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">
                {progress >= 100 ? 'Lepas untuk refresh' : 'Tarik ke bawah'}
              </span>
            </div>
          )}
        </div>
      </div>
      
      {/* Content */}
      <div style={{ transform: `translateY(${isRefreshing ? 60 : pullDistance}px)`, transition: isRefreshing ? 'transform 0.3s' : 'none' }}>
        {children}
      </div>
    </div>
  );
}