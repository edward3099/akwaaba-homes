// Main accessibility component
export { default as AccessibilityEnhancements } from './AccessibilityEnhancements';

// Responsive design components
export { 
  default as ResponsiveWrapper,
  ResponsiveGrid,
  ResponsiveText,
  ResponsiveImage,
  ResponsiveContainer,
  useResponsive,
  BREAKPOINTS,
  type Breakpoint
} from './ResponsiveWrapper';

// Accessibility hook
export { 
  useAccessibility,
  type AccessibilityContext,
  type UseAccessibilityReturn
} from '../../hooks/useAccessibility';
