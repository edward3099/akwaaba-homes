'use client';

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  AlertTriangle, 
  WifiOff, 
  Shield, 
  Server, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { 
  AuthError, 
  getErrorCategoryColor, 
  getErrorCategoryIcon, 
  isRetryableError,
  getRetryDelay
} from '@/lib/utils/authErrorHandler';

interface AuthErrorDisplayProps {
  error: AuthError | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  showTechnical?: boolean;
  className?: string;
}

export function AuthErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  showTechnical = false,
  className = ''
}: AuthErrorDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(showTechnical);

  if (!error) return null;

  const iconName = getErrorCategoryIcon(error.category);
  const IconComponent = getIconComponent(iconName);
  const errorColors = getErrorCategoryColor(error.category);
  const canRetry = isRetryableError(error) && onRetry;
  const retryDelay = getRetryDelay(error);

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };

  const handleDismiss = () => {
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Alert className={`${errorColors} ${className}`}>
      <div className="flex items-start space-x-3">
        <IconComponent className="h-5 w-5 mt-0.5 flex-shrink-0" />
        
        <div className="flex-1 space-y-2">
          {/* Main Error Message */}
          <AlertDescription className="font-medium">
            {error.message}
          </AlertDescription>

          {/* User Action Guidance */}
          {error.userAction && (
            <div className="text-sm opacity-90">
              <strong>What to do:</strong> {error.userAction}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2 pt-1">
            {canRetry && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleRetry}
                className="text-xs h-8 px-3"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                {retryDelay > 0 ? `Retry in ${Math.ceil(retryDelay / 1000)}s` : 'Retry'}
              </Button>
            )}

            {onDismiss && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDismiss}
                className="text-xs h-8 px-3"
              >
                Dismiss
              </Button>
            )}

            {/* Technical Details Toggle */}
            {error.technical && (
              <Collapsible>
                <CollapsibleTrigger>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-xs h-8 px-3"
                    onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
                  >
                    <HelpCircle className="h-3 w-3 mr-1" />
                    {showTechnicalDetails ? 'Hide' : 'Show'} Details
                    {showTechnicalDetails ? (
                      <ChevronUp className="h-3 w-3 ml-1" />
                    ) : (
                      <ChevronDown className="h-3 w-3 ml-1" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                
                {showTechnicalDetails && (
                  <CollapsibleContent className="mt-2">
                    <div className="bg-white/50 rounded p-2 text-xs font-mono opacity-75">
                      <div className="font-semibold mb-1">Technical Details:</div>
                      <div className="break-all">{error.technical}</div>
                    </div>
                  </CollapsibleContent>
                )}
              </Collapsible>
            )}
          </div>
        </div>
      </div>
    </Alert>
  );
}

/**
 * Get the appropriate icon component based on icon name
 */
function getIconComponent(iconName: string) {
  switch (iconName) {
    case 'AlertTriangle':
      return AlertTriangle;
    case 'WifiOff':
      return WifiOff;
    case 'Shield':
      return Shield;
    case 'Server':
      return Server;
    case 'AlertCircle':
    default:
      return AlertCircle;
  }
}

/**
 * Enhanced error display with auto-dismiss functionality
 */
export function AutoDismissErrorDisplay({ 
  error, 
  onRetry, 
  onDismiss, 
  autoDismissDelay = 10000,
  className = ''
}: AuthErrorDisplayProps & { autoDismissDelay?: number }) {
  const [shouldShow, setShouldShow] = useState(true);

  React.useEffect(() => {
    if (error && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        setShouldShow(false);
        onDismiss?.();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [error, autoDismissDelay, onDismiss]);

  if (!error || !shouldShow) return null;

  return (
    <AuthErrorDisplay
      error={error}
      onRetry={onRetry}
      onDismiss={() => {
        setShouldShow(false);
        onDismiss?.();
      }}
      className={className}
    />
  );
}

/**
 * Compact error display for inline use
 */
export function CompactErrorDisplay({ 
  error, 
  className = '' 
}: { error: AuthError | null; className?: string }) {
  if (!error) return null;

  const IconComponent = getIconComponent(getErrorCategoryIcon(error.category));
  const errorColors = getErrorCategoryColor(error.category);

  return (
    <div className={`inline-flex items-center space-x-2 text-sm ${errorColors} px-3 py-2 rounded-md ${className}`}>
      <IconComponent className="h-4 w-4" />
      <span>{error.message}</span>
    </div>
  );
}
