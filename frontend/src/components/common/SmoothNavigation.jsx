import React from 'react';
import { FiArrowDown, FiBarChart, FiHome, FiMessageSquare, FiGrid } from 'react-icons/fi';
import { scrollToElement } from '../../utils/smoothScroll';

const SmoothNavigation = ({ sections = [] }) => {
  const defaultSections = [
    { id: 'dashboard-stats', label: 'Statistics', icon: FiBarChart },
    { id: 'complaints-section', label: 'Complaints', icon: FiHome },
    { id: 'comments-section', label: 'Comments', icon: FiMessageSquare },
  ];

  const navSections = sections.length > 0 ? sections : defaultSections;

  const handleScrollToSection = (sectionId) => {
    scrollToElement(sectionId, 80); // 80px offset for fixed header
  };

  // Helper function to render icon safely
  const renderIcon = (IconComponent) => {
    if (typeof IconComponent === 'function') {
      // If it's a function that returns JSX or string
      const iconContent = IconComponent();
      if (typeof iconContent === 'string') {
        return <span className="w-5 h-5 flex items-center justify-center text-sm">{iconContent}</span>;
      }
      return iconContent;
    } else if (IconComponent) {
      // If it's a React component
      return <IconComponent className="w-5 h-5 flex-shrink-0" />;
    }
    return <FiHome className="w-5 h-5 flex-shrink-0" />; // Fallback icon
  };

  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
      <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 p-2">
        <div className="space-y-2">
          {navSections.map((section) => (
            <button
              key={section.id}
              onClick={() => handleScrollToSection(section.id)}
              className="group flex items-center gap-3 w-full p-3 text-left text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all duration-200"
              title={section.label}
            >
              {renderIcon(section.icon)}
              <span className="text-sm font-medium opacity-0 group-hover:opacity-100 whitespace-nowrap transition-opacity duration-200">
                {section.label}
              </span>
            </button>
          ))}
          
          {/* Scroll indicators */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex flex-col gap-1">
              <FiArrowDown className="w-4 h-4 text-gray-400 mx-auto animate-bounce" />
              <span className="text-xs text-gray-400 text-center">Scroll</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmoothNavigation;