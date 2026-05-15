import { useState, useEffect } from 'react';

interface UseMobileDetectionOptions {
  breakpoint?: number;
  onMobileChange?: (isMobile: boolean) => void;
}

export const useMobileDetection = (options: UseMobileDetectionOptions = {}) => {
  const { breakpoint = 1024, onMobileChange } = options;
  const [isMobile, setIsMobile] = useState(() => {
    // Initialize with current window width if available
    if (typeof window !== 'undefined') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    const checkMobile = () => {
      const currentIsMobile = window.innerWidth < breakpoint;
      
      if (currentIsMobile !== isMobile) {
        setIsMobile(currentIsMobile);
        onMobileChange?.(currentIsMobile);
      }
    };

    // Immediately check on mount
    checkMobile();

    // Add event listeners for various scenarios
    window.addEventListener('resize', checkMobile);
    window.addEventListener('focus', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        checkMobile();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('focus', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [breakpoint, isMobile, onMobileChange]);

  return isMobile;
};

interface UseMobileStateOptions extends UseMobileDetectionOptions {
  restoreStateKey?: string;
}

export const useMobileState = (options: UseMobileStateOptions = {}) => {
  const { restoreStateKey, ...mobileOptions } = options;
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const isMobile = useMobileDetection({
    ...mobileOptions,
    onMobileChange: (mobile) => {
      // Close filter when switching to desktop
      if (!mobile) {
        setIsFilterOpen(false);
      }
    }
  });

  // Restore state when component mounts (if key is provided)
  useEffect(() => {
    if (!restoreStateKey) return;

    const restoreState = () => {
      try {
        const savedState = sessionStorage.getItem(restoreStateKey);
        if (savedState) {
          const { isMobile: savedIsMobile, isFilterOpen: savedIsFilterOpen, timestamp } = JSON.parse(savedState);
          
          // Only restore if the state was saved recently (within 30 seconds)
          const isRecent = Date.now() - timestamp < 30000;
          
          if (isRecent && savedIsMobile === isMobile) {
            setIsFilterOpen(isMobile ? savedIsFilterOpen : false);
          }
          
          // Clear the saved state after using it
          sessionStorage.removeItem(restoreStateKey);
        }
      } catch (error) {
        console.warn('Error restoring mobile state:', error);
      }
    };

    // Small delay to ensure component is fully mounted
    const timeoutId = setTimeout(restoreState, 100);
    
    return () => clearTimeout(timeoutId);
  }, [restoreStateKey, isMobile]);

  const saveState = () => {
    if (!restoreStateKey) return;

    const currentState = {
      isMobile,
      isFilterOpen,
      timestamp: Date.now()
    };
    
    try {
      sessionStorage.setItem(restoreStateKey, JSON.stringify(currentState));
    } catch (error) {
      console.warn('Could not save mobile state:', error);
    }
  };

  return {
    isMobile,
    isFilterOpen,
    setIsFilterOpen,
    saveState
  };
};
