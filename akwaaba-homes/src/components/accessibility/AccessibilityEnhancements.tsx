'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { 
  Accessibility, 
  Eye, 
  EyeOff, 
  Volume2, 
  VolumeX, 
  Smartphone, 
  Monitor, 
  Tablet,
  Keyboard,
  MousePointer,
  Hand,
  Contrast,
  Type,
  Palette,
  Settings,
  CheckCircle,
  AlertTriangle,
  Info
} from 'lucide-react';

// Accessibility context for global settings
interface AccessibilityContextType {
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

// Responsive breakpoints
const BREAKPOINTS = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// Accessibility features configuration
const ACCESSIBILITY_FEATURES = {
  keyboardNavigation: {
    enabled: true,
    shortcuts: {
      'Tab': 'Navigate between interactive elements',
      'Shift + Tab': 'Navigate backwards',
      'Enter/Space': 'Activate buttons and links',
      'Arrow Keys': 'Navigate within components',
      'Escape': 'Close modals and popovers',
      'F6': 'Skip to main content',
      'F7': 'Skip to navigation',
    }
  },
  screenReader: {
    enabled: true,
    announcements: {
      'page-load': 'Page loaded successfully',
      'form-submit': 'Form submitted successfully',
      'error-occurred': 'An error has occurred',
      'loading': 'Loading content',
      'content-updated': 'Content has been updated',
    }
  },
  focusManagement: {
    enabled: true,
    trapFocus: true,
    restoreFocus: true,
    focusIndicator: true,
  },
  colorAccessibility: {
    enabled: true,
    contrastRatio: 4.5, // WCAG AA standard
    colorBlindFriendly: true,
    highContrastMode: false,
  },
  motionAccessibility: {
    enabled: true,
    reduceMotion: false,
    animationDuration: 300,
    transitionTiming: 'ease-in-out',
  },
  textAccessibility: {
    enabled: true,
    minFontSize: 16,
    maxFontSize: 24,
    lineHeightRange: [1.2, 2.0],
    letterSpacingRange: [-0.5, 2.0],
  }
};

export default function AccessibilityEnhancements() {
  const [activeTab, setActiveTab] = useState('overview');
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilityContextType>({
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
  });
  const [currentBreakpoint, setCurrentBreakpoint] = useState<string>('lg');
  const [accessibilityIssues, setAccessibilityIssues] = useState<Array<{
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    severity: 'low' | 'medium' | 'high';
  }>>([]);

  const focusRingRef = useRef<HTMLDivElement>(null);

  // Detect current breakpoint
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= BREAKPOINTS['2xl']) setCurrentBreakpoint('2xl');
      else if (width >= BREAKPOINTS.xl) setCurrentBreakpoint('xl');
      else if (width >= BREAKPOINTS.lg) setCurrentBreakpoint('lg');
      else if (width >= BREAKPOINTS.md) setCurrentBreakpoint('md');
      else if (width >= BREAKPOINTS.sm) setCurrentBreakpoint('sm');
      else setCurrentBreakpoint('xs');
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply high contrast
    if (accessibilitySettings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Apply large text
    if (accessibilitySettings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    // Apply reduced motion
    if (accessibilitySettings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Apply color blind mode
    root.classList.remove('protanopia', 'deuteranopia', 'tritanopia');
    if (accessibilitySettings.colorBlindMode !== 'none') {
      root.classList.add(accessibilitySettings.colorBlindMode);
    }

    // Apply custom CSS variables
    root.style.setProperty('--font-size', `${accessibilitySettings.fontSize}px`);
    root.style.setProperty('--line-height', accessibilitySettings.lineHeight.toString());
    root.style.setProperty('--letter-spacing', `${accessibilitySettings.letterSpacing}px`);
  }, [accessibilitySettings]);

  // Run accessibility audit
  const runAccessibilityAudit = () => {
    const issues: Array<typeof accessibilityIssues[0]> = [];
    
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

    setAccessibilityIssues(issues);
  };

  // Toggle accessibility setting
  const toggleSetting = (setting: keyof AccessibilityContextType) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  // Update numeric setting
  const updateNumericSetting = (setting: keyof AccessibilityContextType, value: number) => {
    setAccessibilitySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  // Skip to main content
  const skipToMainContent = () => {
    const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
    if (mainContent) {
      (mainContent as HTMLElement).focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Skip to navigation
  const skipToNavigation = () => {
    const navigation = document.querySelector('nav') || document.querySelector('[role="navigation"]');
    if (navigation) {
      (navigation as HTMLElement).focus();
      navigation.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.setAttribute('class', 'sr-only');
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  };

  const renderOverviewTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Current Breakpoint */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Breakpoint</CardTitle>
            {currentBreakpoint === 'xs' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
            {currentBreakpoint === 'sm' && <Smartphone className="h-4 w-4 text-muted-foreground" />}
            {currentBreakpoint === 'md' && <Tablet className="h-4 w-4 text-muted-foreground" />}
            {currentBreakpoint === 'lg' && <Monitor className="h-4 w-4 text-muted-foreground" />}
            {currentBreakpoint === 'xl' && <Monitor className="h-4 w-4 text-muted-foreground" />}
            {currentBreakpoint === '2xl' && <Monitor className="h-4 w-4 text-muted-foreground" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{currentBreakpoint.toUpperCase()}</div>
            <p className="text-xs text-muted-foreground">
              {BREAKPOINTS[currentBreakpoint as keyof typeof BREAKPOINTS]}px and above
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Score */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accessibility Score</CardTitle>
            <Accessibility className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.max(0, 100 - (accessibilityIssues.filter(i => i.severity === 'high').length * 20) - (accessibilityIssues.filter(i => i.severity === 'medium').length * 10))}%
            </div>
            <p className="text-xs text-muted-foreground">
              {accessibilityIssues.length} issues found
            </p>
          </CardContent>
        </Card>

        {/* Keyboard Navigation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Keyboard Navigation</CardTitle>
            <Keyboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {accessibilitySettings.focusVisible ? 'Enabled' : 'Disabled'}
            </div>
            <p className="text-xs text-muted-foreground">
              Tab navigation active
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common accessibility shortcuts and actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={skipToMainContent} className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Skip to Main Content (F6)
            </Button>
            <Button onClick={skipToNavigation} variant="outline" className="flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Skip to Navigation (F7)
            </Button>
            <Button onClick={runAccessibilityAudit} variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Run Accessibility Audit
            </Button>
            <Button 
              onClick={() => announceToScreenReader('Accessibility settings updated')} 
              variant="outline" 
              className="flex items-center gap-2"
            >
              <Volume2 className="h-4 w-4" />
              Test Screen Reader
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
          <CardDescription>Available keyboard navigation shortcuts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(ACCESSIBILITY_FEATURES.keyboardNavigation.shortcuts).map(([key, description]) => (
              <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                <kbd className="px-2 py-1 text-sm font-semibold text-gray-800 bg-gray-100 border border-gray-300 rounded">
                  {key}
                </kbd>
                <span className="text-sm text-gray-600">{description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderSettingsTab = () => (
    <div className="space-y-6">
      {/* Visual Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Visual Accessibility</CardTitle>
          <CardDescription>Adjust visual settings for better accessibility</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="high-contrast">High Contrast Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases contrast for better visibility
              </p>
            </div>
            <Switch
              id="high-contrast"
              checked={accessibilitySettings.highContrast}
              onCheckedChange={() => toggleSetting('highContrast')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="large-text">Large Text Mode</Label>
              <p className="text-sm text-muted-foreground">
                Increases text size for better readability
              </p>
            </div>
            <Switch
              id="large-text"
              checked={accessibilitySettings.largeText}
              onCheckedChange={() => toggleSetting('largeText')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="reduced-motion">Reduced Motion</Label>
              <p className="text-sm text-muted-foreground">
                Reduces animations and transitions
              </p>
            </div>
            <Switch
              id="reduced-motion"
              checked={accessibilitySettings.reducedMotion}
              onCheckedChange={() => toggleSetting('reducedMotion')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size: {accessibilitySettings.fontSize}px</Label>
            <Slider
              id="font-size"
              min={12}
              max={24}
              step={1}
              value={[accessibilitySettings.fontSize]}
              onValueChange={(value) => updateNumericSetting('fontSize', value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="line-height">Line Height: {accessibilitySettings.lineHeight}</Label>
            <Slider
              id="line-height"
              min={1.2}
              max={2.0}
              step={0.1}
              value={[accessibilitySettings.lineHeight]}
              onValueChange={(value) => updateNumericSetting('lineHeight', value[0])}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="letter-spacing">Letter Spacing: {accessibilitySettings.letterSpacing}px</Label>
            <Slider
              id="letter-spacing"
              min={-0.5}
              max={2.0}
              step={0.1}
              value={[accessibilitySettings.letterSpacing]}
              onValueChange={(value) => updateNumericSetting('letterSpacing', value[0])}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Color Accessibility */}
      <Card>
        <CardHeader>
          <CardTitle>Color Accessibility</CardTitle>
          <CardDescription>Adjust color settings for color vision deficiencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="color-blind-mode">Color Blind Mode</Label>
            <select
              id="color-blind-mode"
              value={accessibilitySettings.colorBlindMode}
              onChange={(e) => setAccessibilitySettings(prev => ({ ...prev, colorBlindMode: e.target.value as any }))}
              className="w-full p-2 border rounded-md"
            >
              <option value="none">None</option>
              <option value="protanopia">Protanopia (Red-Blind)</option>
              <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
              <option value="tritanopia">Tritanopia (Blue-Blind)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sound-enabled">Sound Effects</Label>
              <p className="text-sm text-muted-foreground">
                Enable audio feedback for interactions
              </p>
            </div>
            <Switch
              id="sound-enabled"
              checked={accessibilitySettings.soundEnabled}
              onCheckedChange={() => toggleSetting('soundEnabled')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Focus Management */}
      <Card>
        <CardHeader>
          <CardTitle>Focus Management</CardTitle>
          <CardDescription>Control how focus is managed throughout the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="focus-visible">Focus Indicators</Label>
              <p className="text-sm text-muted-foreground">
                Show visible focus indicators
              </p>
            </div>
            <Switch
              id="focus-visible"
              checked={accessibilitySettings.focusVisible}
              onCheckedChange={() => toggleSetting('focusVisible')}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="screen-reader-mode">Screen Reader Mode</Label>
              <p className="text-sm text-muted-foreground">
                Enhanced screen reader support
              </p>
            </div>
            <Switch
              id="screen-reader-mode"
              checked={accessibilitySettings.screenReaderMode}
              onCheckedChange={() => toggleSetting('screenReaderMode')}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderIssuesTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Accessibility Issues</h2>
        <Button onClick={runAccessibilityAudit} variant="outline">
          Refresh Audit
        </Button>
      </div>

      {accessibilityIssues.length === 0 ? (
        <Card className="p-8 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No accessibility issues found!</h3>
          <p className="text-gray-500">Your application meets accessibility standards</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {accessibilityIssues.map((issue) => (
            <Card key={issue.id} className={`border-l-4 ${
              issue.severity === 'high' ? 'border-l-red-500' :
              issue.severity === 'medium' ? 'border-l-yellow-500' :
              'border-l-blue-500'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    issue.type === 'error' ? 'bg-red-100 text-red-800' :
                    issue.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {issue.type === 'error' ? <AlertTriangle className="h-4 w-4" /> :
                     issue.type === 'warning' ? <AlertTriangle className="h-4 w-4" /> :
                     <Info className="h-4 w-4" />}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{issue.message}</h4>
                      <Badge variant={
                        issue.severity === 'high' ? 'destructive' :
                        issue.severity === 'medium' ? 'secondary' :
                        'outline'
                      }>
                        {issue.severity}
                      </Badge>
                    </div>
                    
                    {issue.element && (
                      <p className="text-sm text-gray-600 mb-2">
                        Element: <code className="bg-gray-100 px-1 py-0.5 rounded">{issue.element}</code>
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Issue ID: {issue.id}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Accessibility Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>WCAG 2.1 Guidelines</CardTitle>
          <CardDescription>Web Content Accessibility Guidelines compliance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Perceivable</h4>
                <p className="text-sm text-gray-600">Content must be presentable to users in ways they can perceive</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Operable</h4>
                <p className="text-sm text-gray-600">User interface components and navigation must be operable</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Understandable</h4>
                <p className="text-sm text-gray-600">Information and operation of user interface must be understandable</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <h4 className="font-medium">Robust</h4>
                <p className="text-sm text-gray-600">Content must be robust enough to be interpreted by assistive technologies</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderResponsiveTab = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Responsive Design</h2>
      
      {/* Breakpoint Information */}
      <Card>
        <CardHeader>
          <CardTitle>Breakpoint System</CardTitle>
          <CardDescription>Current responsive breakpoints and their usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(BREAKPOINTS).map(([breakpoint, width]) => (
              <div key={breakpoint} className={`flex items-center justify-between p-3 rounded-lg border ${
                currentBreakpoint === breakpoint ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  {breakpoint === 'xs' || breakpoint === 'sm' ? <Smartphone className="h-4 w-4" /> :
                   breakpoint === 'md' ? <Tablet className="h-4 w-4" /> :
                   <Monitor className="h-4 w-4" />}
                  <span className="font-medium">{breakpoint.toUpperCase()}</span>
                </div>
                <div className="text-sm text-gray-600">
                  {width === 0 ? '0px+' : `${width}px+`}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Responsive Utilities */}
      <Card>
        <CardHeader>
          <CardTitle>Responsive Utilities</CardTitle>
          <CardDescription>CSS utilities for responsive design</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium mb-2">Container Classes</h4>
              <div className="space-y-2 text-sm">
                <code className="block bg-white p-2 rounded">container mx-auto</code>
                <code className="block bg-white p-2 rounded">max-w-7xl</code>
                <code className="block bg-white p-2 rounded">px-4 sm:px-6 lg:px-8</code>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium mb-2">Grid Classes</h4>
              <div className="space-y-2 text-sm">
                <code className="block bg-white p-2 rounded">grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3</code>
                <code className="block bg-white p-2 rounded">flex flex-col md:flex-row</code>
                <code className="block bg-white p-2 rounded">hidden md:block</code>
              </div>
            </div>
            
            <div className="p-4 bg-gray-100 rounded-lg">
              <h4 className="font-medium mb-2">Spacing Classes</h4>
              <div className="space-y-2 text-sm">
                <code className="block bg-white p-2 rounded">p-4 md:p-6 lg:p-8</code>
                <code className="block bg-white p-2 rounded">gap-4 md:gap-6 lg:gap-8</code>
                <code className="block bg-white p-2 rounded">text-sm md:text-base lg:text-lg</code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Touch vs Mouse */}
      <Card>
        <CardHeader>
          <CardTitle>Input Methods</CardTitle>
          <CardDescription>Support for different input methods</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <MousePointer className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium">Mouse</h4>
              <p className="text-sm text-gray-600">Hover states, precise clicking</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
                              <Hand className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <h4 className="font-medium">Touch</h4>
              <p className="text-sm text-gray-600">Tap targets, swipe gestures</p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Keyboard className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium">Keyboard</h4>
              <p className="text-sm text-gray-600">Tab navigation, shortcuts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Accessibility & Responsive Design</h1>
              <p className="text-gray-600 mt-2">Enhance user experience across all devices and abilities</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => announceToScreenReader('Accessibility panel opened')}
              >
                <Accessibility className="h-4 w-4 mr-2" />
                Test Announcement
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">
              <Accessibility className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
            <TabsTrigger value="issues">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="responsive">
              <Smartphone className="h-4 w-4 mr-2" />
              Responsive
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {renderOverviewTab()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {renderSettingsTab()}
          </TabsContent>

          <TabsContent value="issues" className="space-y-6">
            {renderIssuesTab()}
          </TabsContent>

          <TabsContent value="responsive" className="space-y-6">
            {renderResponsiveTab()}
          </TabsContent>
        </Tabs>

        {/* Focus Ring Demo */}
        <div 
          ref={focusRingRef}
          className={`mt-8 p-4 border-2 rounded-lg transition-all duration-200 ${
            accessibilitySettings.focusVisible 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-transparent'
          }`}
          tabIndex={0}
          role="button"
          aria-label="Focus ring demonstration"
          onClick={() => announceToScreenReader('Focus ring demonstration clicked')}
        >
          <h3 className="font-medium mb-2">Focus Ring Demonstration</h3>
          <p className="text-sm text-gray-600">
            This element demonstrates the focus ring when tab navigation is enabled. 
            Use Tab to navigate here and see the focus indicator.
          </p>
        </div>
      </div>
    </div>
  );
}
