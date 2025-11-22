/**
 * Smooth scrolling utilities for better user experience
 */

/**
 * Smooth scroll to top of page
 */
export const scrollToTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Smooth scroll to bottom of page
 */
export const scrollToBottom = () => {
  window.scrollTo({
    top: document.body.scrollHeight,
    left: 0,
    behavior: 'smooth'
  });
};

/**
 * Smooth scroll to a specific element by ID
 * @param {string} elementId - The ID of the element to scroll to
 * @param {number} offset - Optional offset from the element (default: 0)
 */
export const scrollToElement = (elementId, offset = 0) => {
  const element = document.getElementById(elementId);
  if (element) {
    const elementPosition = element.offsetTop - offset;
    window.scrollTo({
      top: elementPosition,
      behavior: 'smooth'
    });
  }
};

/**
 * Smooth scroll within a container element
 * @param {HTMLElement} container - The container element to scroll within
 * @param {number} top - The scroll position
 */
export const scrollWithinContainer = (container, top) => {
  if (container) {
    container.scrollTo({
      top: top,
      behavior: 'smooth'
    });
  }
};

/**
 * Smooth scroll to show element in view
 * @param {HTMLElement} element - The element to scroll into view
 * @param {string} block - Vertical alignment ('start', 'center', 'end', 'nearest')
 * @param {string} inline - Horizontal alignment ('start', 'center', 'end', 'nearest')
 */
export const scrollIntoView = (element, block = 'start', inline = 'nearest') => {
  if (element && element.scrollIntoView) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: block,
      inline: inline
    });
  }
};

/**
 * Smooth scroll with custom duration (for browsers that don't support native smooth scrolling)
 * @param {number} targetPosition - The target scroll position
 * @param {number} duration - Animation duration in milliseconds
 */
export const smoothScrollCustom = (targetPosition, duration = 1000) => {
  const startPosition = window.pageYOffset;
  const distance = targetPosition - startPosition;
  let startTime = null;

  function animation(currentTime) {
    if (startTime === null) startTime = currentTime;
    const timeElapsed = currentTime - startTime;
    const run = easeInOutQuad(timeElapsed, startPosition, distance, duration);
    window.scrollTo(0, run);
    if (timeElapsed < duration) requestAnimationFrame(animation);
  }

  // Easing function for smooth animation
  function easeInOutQuad(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animation);
};

/**
 * Auto-scroll to bottom of chat/comments container
 * @param {HTMLElement} container - The container to scroll
 */
export const scrollToBottomOfContainer = (container) => {
  if (container) {
    container.scrollTo({
      top: container.scrollHeight,
      behavior: 'smooth'
    });
  }
};

/**
 * Check if smooth scroll is supported
 * @returns {boolean} - Whether smooth scrolling is supported
 */
export const isSmoothScrollSupported = () => {
  return 'scrollBehavior' in document.documentElement.style;
};