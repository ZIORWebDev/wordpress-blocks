// Safe debounce implementation compatible with WordPress environment
export const debounce = (func, wait = 0) => {
  if (typeof window !== 'undefined') {
    const wpLodash = window.wp?.lodash?.debounce || window.lodash?.debounce || window._?.debounce;
    if (wpLodash) return wpLodash(func, wait);
  }

  // Fallback debounce implementation
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
};
