import { useEffect, useState, useCallback } from 'react';
import { scrollToTop, scrollToElement, scrollIntoView } from '../utils/smoothScroll';

/**
 * Custom hook for smooth scrolling functionality
 */
export const useSmoothScroll = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  // Track scroll position
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Track scrolling state
  useEffect(() => {
    let timeoutId;
    
    const handleScrollStart = () => {
      setIsScrolling(true);
      clearTimeout(timeoutId);
      
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150); // Consider scrolling finished after 150ms of no scroll
    };

    window.addEventListener('scroll', handleScrollStart);
    return () => {
      window.removeEventListener('scroll', handleScrollStart);
      clearTimeout(timeoutId);
    };
  }, []);

  // Smooth scroll to top
  const scrollToTopSmooth = useCallback(() => {
    scrollToTop();
  }, []);

  // Smooth scroll to element by ID
  const scrollToElementSmooth = useCallback((elementId, offset = 0) => {
    scrollToElement(elementId, offset);
  }, []);

  // Smooth scroll element into view
  const scrollElementIntoView = useCallback((element, block = 'start') => {
    scrollIntoView(element, block);
  }, []);

  // Check if element is in viewport
  const isInViewport = useCallback((element) => {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }, []);

  // Get scroll progress (0 to 1)
  const getScrollProgress = useCallback(() => {
    const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
    const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    return height > 0 ? winScroll / height : 0;
  }, []);

  return {
    scrollY,
    isScrolling,
    scrollToTopSmooth,
    scrollToElementSmooth,
    scrollElementIntoView,
    isInViewport,
    getScrollProgress,
  };
};

/**
 * Hook for smooth scrolling within a container
 */
export const useContainerScroll = (containerRef) => {
  const [scrollTop, setScrollTop] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId;

    const handleScroll = () => {
      setScrollTop(container.scrollTop);
      setIsScrolling(true);
      
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsScrolling(false);
      }, 150);
    };

    container.addEventListener('scroll', handleScroll);
    return () => {
      container.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [containerRef]);

  const scrollToTopOfContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [containerRef]);

  const scrollToBottomOfContainer = useCallback(() => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [containerRef]);

  return {
    scrollTop,
    isScrolling,
    scrollToTopOfContainer,
    scrollToBottomOfContainer,
  };
};