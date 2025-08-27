"use client";

import { useState, useEffect, useCallback, useRef } from 'react';

// Accessibility context interface
export interface AccessibilityContext {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  soundEnabled: boolean;
  focusVisible: boolean;
  screenReaderMode: boolean;
  colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: number;
  lineHeight: number;
  letterSpacing: number;
}

// Accessibility hook return type
export interface UseAccessibilityReturn {
  // State
  accessibility: AccessibilityContext;
  
  // Actions
  toggleSetting: (setting: keyof AccessibilityContext) => void;
  updateNumericSetting: (setting: keyof AccessibilityContext, value: number) => void;
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void;
  skipToMainContent: () => void;
  skipToNavigation: () => void;
  runAccessibilityAudit: () => Promise<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    severity: 'low' | 'medium' | 'high';
  }>>;
  
  // Focus management
  trapFocus: (containerRef: React.RefObject<HTMLElement>) => void;
  restoreFocus: () => void;
  focusFirstInteractive: (containerRef: React.RefObject<HTMLElement>) => void;
  focusLastInteractive: (containerRef: React.RefObject<HTMLElement>) => void;
  
  // Keyboard navigation
  handleKeyDown: (event: KeyboardEvent, handlers: {
    onEnter?: () => void;
    onSpace?: () => void;
    onEscape?: () => void;
    onArrowUp?: () => void;
    onArrowDown?: () => void;
    onArrowLeft?: () => void;
    onArrowRight?: () => void;
    onTab?: () => void;
    onShiftTab?: () => void;
  }) => void;
  
  // Utility functions
  isKeyboardUser: boolean;
  isTouchDevice: boolean;
  isReducedMotion: boolean;
  isHighContrast: boolean;
}

// Default accessibility settings
const DEFAULT_ACCESSIBILITY: AccessibilityContext = {
  highContrast: false,
  largeText: false,
  reducedMotion: false,
  soundEnabled: true,
  focusVisible: true,
  screenReaderMode: false,
  colorBlindMode: 'none',
  fontSize: 16,
  lineHeight: 1.5,
  letterSpacing: 0,
};

// Keyboard event handlers
const createKeyboardHandler = (
  event: KeyboardEvent,
  handlers: Parameters<UseAccessibilityReturn['handleKeyDown']>[1]
) => {
  const { key, shiftKey, ctrlKey, altKey, metaKey } = event;
  
  // Prevent default behavior for accessibility keys
  if (['Tab', 'Enter', 'Space', 'Escape', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    event.preventDefault();
  }
  
  // Handle specific key combinations
  switch (key) {
    case 'Enter':
      handlers.onEnter?.();
      break;
    case ' ':
      handlers.onSpace?.();
      break;
    case 'Escape':
      handlers.onEscape?.();
      break;
    case 'ArrowUp':
      handlers.onArrowUp?.();
      break;
    case 'ArrowDown':
      handlers.onArrowDown?.();
      break;
    case 'ArrowLeft':
      handlers.onArrowLeft?.();
      break;
    case 'ArrowRight':
      handlers.onArrowRight?.();
      break;
    case 'Tab':
      if (shiftKey) {
        handlers.onShiftTab?.();
      } else {
        handlers.onTab?.();
      }
      break;
  }
};

export const useAccessibility = (): UseAccessibilityReturn => {
  const [accessibility, setAccessibility] = useState<AccessibilityContext>(DEFAULT_ACCESSIBILITY);
  const [isKeyboardUser, setIsKeyboardUser] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const focusTrapRef = useRef<HTMLElement | null>(null);

  // Detect user preferences and device capabilities
  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleReducedMotionChange = (e: MediaQueryListEvent) => {
      setIsReducedMotion(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleReducedMotionChange);
    
    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);
    
    const handleContrastChange = (e: MediaQueryListEvent) => {
      setIsHighContrast(e.matches);
    };
    
    contrastQuery.addEventListener('change', handleContrastChange);
    
    // Detect touch device
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    // Detect keyboard user
    const handleKeyDown = () => setIsKeyboardUser(true);
    const handleMouseDown = () => setIsKeyboardUser(false);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      mediaQuery.removeEventListener('change', handleReducedMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (accessibility.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (accessibility.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Apply reduced motion
    if (accessibility.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (accessibility.colorBlindMode !== 'none') {
      root.classList.add(accessibility.colorBlindMode);
    }

    // Apply custom CSS variables
    root.style.setProperty('--font-size', `${accessibility.fontSize}px`);
    root.style.setProperty('--line-height', accessibility.lineHeight.toString());
    root.style.setProperty('--letter-spacing', `${accessibility.letterSpacing}px`);
  }, [accessibility]);

  // Toggle accessibility setting
  const toggleSetting = useCallback((setting: keyof AccessibilityContext) => {
    setAccessibility(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  }, []);

  // Update numeric setting
  const updateNumericSetting = useCallback((setting: keyof AccessibilityContext, value: number) => {
    setAccessibility(prev => ({
      ...prev,
      [setting]: value
    }));
  }, []);

  // Announce to screen readers
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }, []);

  // Skip to main content
  const skipToMainContent = useCallback(() => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Moved to main content');
    }
  }, [announceToScreenReader]);

  // Skip to navigation
  const skipToNavigation = useCallback(() => {
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (navigation) {
      (navigation as HTMLElement).focus();
      navigation.scrollIntoView({ behavior: 'smooth' });
      announceToScreenReader('Moved to navigation');
    }
  }, [announceToScreenReader]);

  // Run accessibility audit
  const runAccessibilityAudit = useCallback(async () => {
    const issues: Array<{
      id: string;
      type: 'error' | 'warning' | 'info';
      message: string;
      element?: string;
      severity: 'low' | 'medium' | 'high';
    }> = [];
    
    // Check for missing alt text on images
    const images = document.querySelectorAll('img');
    images.forEach((img, index) => {
      if (!img.alt && !img.getAttribute('aria-label')) {
        issues.push({
          id: `img-${index}`,
          type: 'error',
          message: 'Image missing alt text or aria-label',
          element: img.tagName,
          severity: 'high',
        });
      }
    });

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach((heading, index) => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level - previousLevel > 1) {
        issues.push({
          id: `heading-${index}`,
          type: 'warning',
          message: `Heading level skipped from h${previousLevel} to h${level}`,
          element: heading.tagName,
          severity: 'medium',
        });
      }
      previousLevel = level;
    });

    // Check for proper form labels
    const formInputs = document.querySelectorAll('input, select, textarea');
    formInputs.forEach((input, index) => {
      const id = input.getAttribute('id');
      const label = document.querySelector(`label[for="${id}"]`);
      const ariaLabel = input.getAttribute('aria-label');
      const ariaLabelledBy = input.getAttribute('aria-labelledby');
      
      if (!label && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          id: `input-${index}`,
          type: 'error',
          message: 'Form input missing label, aria-label, or aria-labelledby',
          element: input.tagName,
          severity: 'high',
        });
      }
    });

    // Check for proper button labels
    const buttons = document.querySelectorAll('button');
    buttons.forEach((button, index) => {
      const text = button.textContent?.trim();
      const ariaLabel = button.getAttribute('aria-label');
      const ariaLabelledBy = button.getAttribute('aria-labelledby');
      
      if (!text && !ariaLabel && !ariaLabelledBy) {
        issues.push({
          id: `button-${index}`,
          type: 'error',
          message: 'Button missing text content, aria-label, or aria-labelledby',
          element: button.tagName,
          severity: 'high',
        });
      }
    });

    // Check for proper ARIA landmarks
    const landmarks = document.querySelectorAll('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]');
    landmarks.forEach((landmark, index) => {
      const ariaLabel = landmark.getAttribute('aria-label');
      const ariaLabelledBy = landmark.getAttribute('aria-labelledby');
      
      if (!ariaLabel && !ariaLabelledBy) {
        issues.push({
          id: `landmark-${index}`,
          type: 'warning',
          message: 'Landmark missing aria-label or aria-labelledby',
          element: landmark.tagName,
          severity: 'medium',
        });
      }
    });

    return issues;
  }, []);

  // Focus management functions
  const trapFocus = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    // Store current focus
    previousFocusRef.current = document.activeElement as HTMLElement;
    focusTrapRef.current = containerRef.current;
    
    // Find all focusable elements
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    // Focus first element
    firstElement.focus();
    
    // Handle tab key to trap focus
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };
    
    containerRef.current.addEventListener('keydown', handleTabKey);
    
    // Return cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.removeEventListener('keydown', handleTabKey);
      }
    };
  }, []);

  const restoreFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      previousFocusRef.current = null;
    }
    focusTrapRef.current = null;
  }, []);

  const focusFirstInteractive = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }
  }, []);

  const focusLastInteractive = useCallback((containerRef: React.RefObject<HTMLElement>) => {
    if (!containerRef.current) return;
    
    const focusableElements = containerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length > 0) {
      (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
    }
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((
    event: KeyboardEvent,
    handlers: {
      onEnter?: () => void;
      onSpace?: () => void;
      onEscape?: () => void;
      onArrowUp?: () => void;
      onArrowDown?: () => void;
      onArrowLeft?: () => void;
      onArrowRight?: () => void;
      onTab?: () => void;
      onShiftTab?: () => void;
    }
  ) => {
    createKeyboardHandler(event, handlers);
  }, []);

  return {
    accessibility,
    toggleSetting,
    updateNumericSetting,
    announceToScreenReader,
    skipToMainContent,
    skipToNavigation,
    runAccessibilityAudit,
    trapFocus,
    restoreFocus,
    focusFirstInteractive,
    focusLastInteractive,
    handleKeyDown,
    isKeyboardUser,
    isTouchDevice,
    isReducedMotion,
    isHighContrast,
  };
};
