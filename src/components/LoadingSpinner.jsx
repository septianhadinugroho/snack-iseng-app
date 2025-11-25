import React from 'react';

export default function LoadingSpinner({ text = "Memuat data...", fullHeight = true }) {
  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${fullHeight ? 'min-h-[90vh]' : 'py-20'}`}>
      <div className="relative w-16 h-16">
        {/* Outer spinning circle */}
        <div className="absolute inset-0 border-4 border-orange-200 dark:border-orange-900 rounded-full"></div>
        {/* Inner spinning gradient */}
        <div className="absolute inset-0 border-4 border-transparent border-t-orange-500 rounded-full animate-spin"></div>
        {/* Center dot pulse */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-orange-500 rounded-full animate-pulse"></div>
        </div>
      </div>
      <p className="text-sm font-bold text-gray-600 dark:text-gray-400 animate-pulse">{text}</p>
    </div>
  );
}