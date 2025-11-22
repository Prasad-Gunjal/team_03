import React, { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { scrollToTop } from '../../utils/smoothScroll';

const BackToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 hover:shadow-xl transition-all duration-300 transform hover:scale-110 animate-bounce"
          aria-label="Back to top"
        >
          <FiArrowUp className="w-6 h-6" />
        </button>
      )}
    </>
  );
};

export default BackToTopButton;