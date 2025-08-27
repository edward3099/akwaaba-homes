'use client';

import React, { useState, useEffect, ReactNode } from 'react';

// Responsive breakpoints
export const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

// Responsive wrapper props
interface ResponsiveWrapperProps {
  children: ReactNode;
  className?: string;
  // Responsive visibility
  hideOn?: Breakpoint[];
  showOn?: Breakpoint[];
  // Responsive sizing
  size?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  // Responsive spacing
  spacing?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  // Responsive layout
  layout?: 'stack' | 'grid' | 'flex';
  columns?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  // Responsive behavior
  behavior?: 'hide' | 'show' | 'transform' | 'resize';
  // Custom responsive classes
  responsiveClasses?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
}

// Responsive hook
export const useResponsive = () => {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });
      
      // Determine current breakpoint
      if (width >= BREAKPOINTS['2xl']) setCurrentBreakpoint('2xl');
      else if (width >= BREAKPOINTS.xl) setCurrentBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setCurrentBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setCurrentBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    if (typeof window !== 'undefined') {
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const isBreakpoint = (breakpoint: Breakpoint) => currentBreakpoint === breakpoint;
  const isAboveBreakpoint = (breakpoint: Breakpoint) => windowSize.width >= BREAKPOINTS[breakpoint];
  const isBelowBreakpoint = (breakpoint: Breakpoint) => windowSize.width < BREAKPOINTS[breakpoint];
  const isBetweenBreakpoints = (min: Breakpoint, max: Breakpoint) => 
    windowSize.width >= BREAKPOINTS[min] && windowSize.width < BREAKPOINTS[max];

  return {
    currentBreakpoint,
    windowSize,
    isBreakpoint,
    isAboveBreakpoint,
    isBelowBreakpoint,
    isBetweenBreakpoints,
  };
};

// Responsive wrapper component
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = '',
  hideOn = [],
  showOn = [],
  size,
  spacing,
  layout = 'stack',
  columns,
  behavior = 'show',
  responsiveClasses,
}) => {
  const { currentBreakpoint, isAboveBreakpoint } = useResponsive();

  // Determine if component should be visible
  const shouldHide = hideOn.includes(currentBreakpoint);
  const shouldShow = showOn.length > 0 ? showOn.includes(currentBreakpoint) : true;
  const isVisible = shouldShow && !shouldHide;

  // Generate responsive classes
  const generateResponsiveClasses = () => {
    let classes = className;

    // Add size classes
    if (size) {
      Object.entries(size).forEach(([breakpoint, sizeClass]) => {
        if (isAboveBreakpoint(breakpoint as Breakpoint)) {
          classes += ` ${sizeClass}`;
        }
      });
    }

    // Add spacing classes
    if (spacing) {
      Object.entries(spacing).forEach(([breakpoint, spacingClass]) => {
        if (isAboveBreakpoint(breakpoint as Breakpoint)) {
          classes += ` ${spacingClass}`;
        }
      });
    }

    // Add layout classes
    if (layout === 'grid' && columns) {
      Object.entries(columns).forEach(([breakpoint, cols]) => {
        if (isAboveBreakpoint(breakpoint as Breakpoint)) {
          classes += ` grid-cols-${cols}`;
        }
      });
    }

    // Add custom responsive classes
    if (responsiveClasses) {
      Object.entries(responsiveClasses).forEach(([breakpoint, customClass]) => {
        if (isAboveBreakpoint(breakpoint as Breakpoint)) {
          classes += ` ${customClass}`;
        }
      });
    }

    return classes.trim();
  };

  // Handle different behaviors
  const renderContent = () => {
    if (!isVisible) {
      return null;
    }

    switch (behavior) {
      case 'hide':
        return null;
      case 'transform':
        return (
          <div className={`transform transition-all duration-300 ${generateResponsiveClasses()}`}>
            {children}
          </div>
        );
      case 'resize':
        return (
          <div className={`resize transition-all duration-300 ${generateResponsiveClasses()}`}>
            {children}
          </div>
        );
      default:
        return (
          <div className={generateResponsiveClasses()}>
            {children}
          </div>
        );
    }
  };

  // Don't render if hidden
  if (!isVisible) {
    return null;
  }

  return <>{renderContent()}</>;
};

// Responsive grid component
interface ResponsiveGridProps {
  children: ReactNode;
  className?: string;
  columns: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
    '2xl'?: number;
  };
  gap?: string;
  alignItems?: string;
  justifyItems?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = '',
  columns,
  gap = 'gap-4',
  alignItems = 'items-start',
  justifyItems = 'justify-items-start',
}) => {
  const { currentBreakpoint } = useResponsive();

  const getCurrentColumns = () => {
    // Find the highest breakpoint that's at or below current
    const breakpoints = Object.keys(columns).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return columns[bp] || 1;
      }
    }
    return columns.xs || 1;
  };

  const gridCols = getCurrentColumns();

  return (
    <div
      className={`grid ${gap} ${alignItems} ${justifyItems} ${className}`}
      style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
    >
      {children}
    </div>
  );
};

// Responsive text component
interface ResponsiveTextProps {
  children: ReactNode;
  className?: string;
  sizes: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  weights?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  className = '',
  sizes,
  weights,
}) => {
  const { currentBreakpoint } = useResponsive();

  const getCurrentSize = () => {
    const breakpoints = Object.keys(sizes).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return sizes[bp] || 'text-base';
      }
    }
    return sizes.xs || 'text-base';
  };

  const getCurrentWeight = () => {
    if (!weights) return '';
    const breakpoints = Object.keys(weights).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return weights[bp] || '';
      }
    }
    return weights.xs || '';
  };

  const sizeClass = getCurrentSize();
  const weightClass = getCurrentWeight();

  return (
    <span className={`${sizeClass} ${weightClass} ${className}`.trim()}>
      {children}
    </span>
  );
};

// Responsive image component
interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  sizes: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  responsive?: boolean;
}

export const ResponsiveImage: React.FC<ResponsiveImageProps> = ({
  src,
  alt,
  className = '',
  sizes,
  responsive = true,
}) => {
  const { currentBreakpoint } = useResponsive();

  const getCurrentSize = () => {
    const breakpoints = Object.keys(sizes).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return sizes[bp] || 'w-full';
      }
    }
    return sizes.xs || 'w-full';
  };

  const sizeClass = getCurrentSize();

  return (
    <img
      src={src}
      alt={alt}
      className={`${sizeClass} ${responsive ? 'h-auto' : ''} ${className}`.trim()}
      loading="lazy"
    />
  );
};

// Responsive container component
interface ResponsiveContainerProps {
  children: ReactNode;
  className?: string;
  maxWidth?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  padding?: {
    xs?: string;
    sm?: string;
    md?: string;
    lg?: string;
    xl?: string;
    '2xl'?: string;
  };
  center?: boolean;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = '',
  maxWidth,
  padding,
  center = true,
}) => {
  const { currentBreakpoint } = useResponsive();

  const getCurrentMaxWidth = () => {
    if (!maxWidth) return 'max-w-7xl';
    const breakpoints = Object.keys(maxWidth).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return maxWidth[bp] || 'max-w-7xl';
      }
    }
    return maxWidth.xs || 'max-w-7xl';
  };

  const getCurrentPadding = () => {
    if (!padding) return 'px-4 sm:px-6 lg:px-8';
    const breakpoints = Object.keys(padding).reverse() as Breakpoint[];
    for (const bp of breakpoints) {
      if (currentBreakpoint === bp || currentBreakpoint === 'xs') {
        return padding[bp] || 'px-4';
      }
    }
    return padding.xs || 'px-4';
  };

  const maxWidthClass = getCurrentMaxWidth();
  const paddingClass = getCurrentPadding();
  const centerClass = center ? 'mx-auto' : '';

  return (
    <div className={`${maxWidthClass} ${paddingClass} ${centerClass} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
