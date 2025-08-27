'use client';

import React, { useState, useEffect } from 'react';
import { 
  validatePassword, 
  getPasswordStrengthLabel, 
  getPasswordStrengthColor,
  generateSecurePassword,
  type PasswordStrength,
  type PasswordPolicy 
} from '@/lib/utils/passwordValidation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
  onPasswordChange: (password: string) => void;
  onStrengthChange?: (strength: PasswordStrength) => void;
  policy?: PasswordPolicy;
  userData?: { email?: string; name?: string };
  showSuggestions?: boolean;
  className?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function PasswordStrengthMeter({
  password,
  onPasswordChange,
  onStrengthChange,
  policy,
  userData,
  showSuggestions = true,
  className,
  label = 'Password',
  placeholder = 'Enter your password',
  required = false,
  disabled = false,
  error
}: PasswordStrengthMeterProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength | null>(null);
  const [copied, setCopied] = useState(false);

  // Validate password whenever it changes
  useEffect(() => {
    if (password) {
      const validation = validatePassword(password, policy, userData);
      setStrength(validation);
      onStrengthChange?.(validation);
    } else {
      setStrength(null);
      onStrengthChange?.(null);
    }
  }, [password, policy, userData, onStrengthChange]);

  // Generate secure password
  const handleGeneratePassword = () => {
    const newPassword = generateSecurePassword(16);
    onPasswordChange(newPassword);
  };

  // Copy password to clipboard
  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy password:', err);
    }
  };

  // Get strength bar color
  const getStrengthBarColor = (score: number) => {
    switch (score) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  // Get strength bar width
  const getStrengthBarWidth = (score: number) => {
    return `${((score + 1) / 5) * 100}%`;
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Password Input */}
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'pr-20',
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500'
            )}
          />
          
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-1">
            {/* Copy Button */}
            {password && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyPassword}
                className="h-8 w-8 p-0 hover:bg-gray-100"
                title="Copy password"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-gray-500" />
                )}
              </Button>
            )}
            
            {/* Generate Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleGeneratePassword}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title="Generate secure password"
            >
              <RefreshCw className="h-4 w-4 text-gray-500" />
            </Button>
            
            {/* Show/Hide Button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPassword(!showPassword)}
              className="h-8 w-8 p-0 hover:bg-gray-100"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-500" />
              ) : (
                <Eye className="h-4 w-4 text-gray-500" />
              )}
            </Button>
          </div>
        </div>
        
        {error && (
          <p className="text-sm text-red-600 flex items-center">
            <XCircle className="h-4 w-4 mr-1" />
            {error}
          </p>
        )}
      </div>

      {/* Password Strength Meter */}
      {password && strength && (
        <div className="space-y-3">
          {/* Strength Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Password Strength:</span>
              <span className={cn('font-medium', getPasswordStrengthColor(strength.score))}>
                {getPasswordStrengthLabel(strength.score)}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={cn('h-2 rounded-full transition-all duration-300', getStrengthBarColor(strength.score))}
                style={{ width: getStrengthBarWidth(strength.score) }}
              />
            </div>
          </div>

          {/* Requirements Checklist */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Requirements:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(strength.requirements).map(([key, met]) => {
                const label = key
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace('Min Length', 'Minimum Length')
                  .replace('Has Uppercase', 'Uppercase Letters')
                  .replace('Has Lowercase', 'Lowercase Letters')
                  .replace('Has Numbers', 'Numbers')
                  .replace('Has Special Chars', 'Special Characters')
                  .replace('No Common Patterns', 'No Common Patterns')
                  .replace('No Personal Info', 'No Personal Info');

                return (
                  <div key={key} className="flex items-center space-x-2 text-sm">
                    {met ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span className={cn(met ? 'text-gray-700' : 'text-gray-500')}>
                      {label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Feedback */}
          {strength.feedback.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Issues:</h4>
              <div className="space-y-1">
                {strength.feedback.map((message, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-red-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && strength.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Suggestions:</h4>
              <div className="space-y-1">
                {strength.suggestions.map((suggestion, index) => (
                  <div key={index} className="flex items-start space-x-2 text-sm text-blue-600">
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Final Status */}
          <div className={cn(
            'p-3 rounded-lg border',
            strength.meetsRequirements 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          )}>
            <div className="flex items-center space-x-2">
              {strength.meetsRequirements ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              )}
              <span className={cn(
                'text-sm font-medium',
                strength.meetsRequirements ? 'text-green-800' : 'text-yellow-800'
              )}>
                {strength.meetsRequirements 
                  ? 'Password meets all requirements!' 
                  : 'Password does not meet all requirements'
                }
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Password Policy Info */}
      {!password && (
        <div className="text-sm text-gray-500 space-y-1">
          <p>Password must contain:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>At least {policy?.minLength || 12} characters</li>
            <li>Uppercase and lowercase letters</li>
            <li>Numbers and special characters</li>
            <li>No common patterns or personal information</li>
          </ul>
        </div>
      )}
    </div>
  );
}

