'use client';

import React, { forwardRef } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { FieldValidation } from '@/hooks/useFormValidation';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

export interface FormFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
  validation?: FieldValidation;
  helperText?: string;
  required?: boolean;
  showValidation?: boolean;
  className?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  helperClassName?: string;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(
  (
    {
      label,
      error,
      validation,
      helperText,
      required = false,
      showValidation = true,
      className = '',
      labelClassName = '',
      inputClassName = '',
      errorClassName = '',
      helperClassName = '',
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
    const hasError = error || (validation && !validation.isValid);
    const isValid = validation && validation.isValid && validation.isDirty;
    const showError = hasError && (validation?.isTouched || validation?.isDirty);
    const showSuccess = isValid && validation.isTouched;

    return (
      <div className={cn('space-y-2', className)}>
        {/* Label */}
        <Label 
          htmlFor={fieldId} 
          className={cn(
            'text-sm font-medium text-gray-700',
            required && 'after:content-["*"] after:ml-1 after:text-red-500',
            labelClassName
          )}
        >
          {label}
        </Label>

        {/* Input */}
        <div className="relative">
          <Input
            ref={ref}
            id={fieldId}
            aria-invalid={hasError ? 'true' : 'false'}
            aria-describedby={
              showError ? `${fieldId}-error` : 
              helperText ? `${fieldId}-helper` : 
              undefined
            }
            autoComplete={
              props.type === 'email' ? 'email' :
              props.type === 'password' ? 'current-password' :
              props.type === 'tel' ? 'tel' :
              props.name === 'firstName' ? 'given-name' :
              props.name === 'lastName' ? 'family-name' :
              props.name === 'company' ? 'organization' :
              'on'
            }
            className={cn(
              'transition-colors duration-200',
              showError && 'border-red-500 focus:border-red-500 focus:ring-red-500',
              showSuccess && 'border-green-500 focus:border-green-500 focus:ring-green-500',
              inputClassName
            )}
            {...props}
          />

          {/* Validation Icons */}
          {showValidation && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {showError && (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {showSuccess && (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          )}
        </div>

        {/* Helper Text */}
        {helperText && (
          <p 
            id={`${fieldId}-helper`}
            className={cn(
              'text-xs text-gray-500',
              helperClassName
            )}
          >
            {helperText}
          </p>
        )}

        {/* Error Message */}
        {showError && (
          <div 
            id={`${fieldId}-error`}
            className={cn(
              'flex items-center space-x-2 text-sm text-red-600',
              errorClassName
            )}
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error || validation?.error}</span>
          </div>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div 
            className="flex items-center space-x-2 text-sm text-green-600"
            role="status"
            aria-live="polite"
          >
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            <span>Looks good!</span>
          </div>
        )}

        {/* Validation Status */}
        {validation && showValidation && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Info className="h-3 w-3" />
            <span>
              {validation.isDirty ? 'Field modified' : 'Field untouched'}
              {validation.isTouched && ' • Field touched'}
            </span>
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

/**
 * Enhanced form field with password toggle
 */
export interface PasswordFieldProps extends Omit<FormFieldProps, 'type'> {
  showPassword?: boolean;
  onTogglePassword?: () => void;
  showToggle?: boolean;
}

export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  (
    {
      showPassword = false,
      onTogglePassword,
      showToggle = true,
      className = '',
      inputClassName = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('relative', className)}>
        <FormField
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          inputClassName={cn('pr-12', inputClassName)}
          autoComplete={
            props.name === 'newPassword' || props.name === 'confirmPassword' ? 'new-password' :
            'current-password'
          }
          {...props}
        />
        
        {showToggle && onTogglePassword && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }
);

PasswordField.displayName = 'PasswordField';

/**
 * Enhanced form field with select dropdown
 */
export interface SelectFieldProps extends Omit<FormFieldProps, 'type'> {
  options: Array<{ value: string; label: string; disabled?: boolean }>;
  placeholder?: string;
  onValueChange?: (value: string) => void;
}

export const SelectField = forwardRef<HTMLInputElement, SelectFieldProps>(
  (
    {
      label,
      options,
      placeholder = 'Select an option',
      onValueChange,
      className = '',
      ...props
    },
    ref
  ) => {
    return (
      <div className={cn('space-y-2', className)}>
        <Label className="text-sm font-medium text-gray-700">
          {label}
        </Label>
        
        <select
          ref={ref as any}
          onChange={(e) => {
            onValueChange?.(e.target.value);
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          {...(({ 
            onChange, 
            onCopy, 
            onCut, 
            onPaste, 
            onCopyCapture,
            onCutCapture,
            onPasteCapture,
            onCompositionEnd,
            onCompositionStart,
            onCompositionUpdate,
            onInput,
            onInputCapture,
            ...rest 
          }) => rest)(props as any)}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

SelectField.displayName = 'SelectField';
