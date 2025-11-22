import React from 'react';
import { useSmoothScroll } from '../../hooks/useSmoothScroll';

const ScrollProgressIndicator = ({ 
  showPercentage = false, 
  height = '3px', 
  backgroundColor = 'bg-purple-600',
  className = '' 
}) => {
  const { getScrollProgress } = useSmoothScroll();
  const progress = getScrollProgress() * 100;

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 ${className}`}>
      <div className="w-full bg-gray-200 shadow-sm">
        <div 
          className={`${backgroundColor} transition-all duration-150 ease-out`}
          style={{ 
            width: `${progress}%`, 
            height: height,
            borderRadius: '0 2px 2px 0'
          }}
        />
      </div>
      
      {showPercentage && (
        <div className="absolute right-4 top-1 text-xs text-gray-600 bg-white px-2 py-1 rounded shadow">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
};

export default ScrollProgressIndicator;