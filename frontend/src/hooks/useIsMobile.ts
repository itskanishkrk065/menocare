import { useState, useEffect } from 'react';

/**
 * Hook to reactively observe mobile and tablet viewport breakpoints.
 * Default mobile breakpoint: 768px (standard md)
 * Default tablet breakpoint: 1024px (standard lg)
 */
export function useIsMobile(breakpoint: number = 768): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < breakpoint;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkSize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', checkSize, { passive: true });
    // Run immediate check
    checkSize();

    return () => window.removeEventListener('resize', checkSize);
  }, [breakpoint]);

  return isMobile;
}
