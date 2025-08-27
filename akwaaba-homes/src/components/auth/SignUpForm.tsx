'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/lib/auth/authContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, UserPlus, Shield, CheckCircle } from 'lucide-react';
import { FormField, PasswordField } from '@/components/ui/FormField';
import { AuthErrorDisplay } from '@/components/ui/AuthErrorDisplay';
import { parseAuthError, AuthError } from '@/lib/utils/authErrorHandler';
import { useFormValidation } from '@/hooks/useFormValidation';
import { PasswordStrengthMeter } from '@/components/ui/PasswordStrengthMeter';
import { isPasswordAcceptable, DEFAULT_PASSWORD_POLICY } from '@/lib/utils/passwordValidation';
import { useRouter } from 'next/navigation';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .refine((password) => isPasswordAcceptable(password, DEFAULT_PASSWORD_POLICY), {
      message: 'Password does not meet security requirements'
    }),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional(),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
  agreeToMarketing: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignUpFormData = z.infer<typeof signUpSchema>;

interface SignUpFormProps {
  onSuccess?: () => void;
  onSwitchToSignIn?: () => void;
}

export default function SignUpForm({ onSuccess, onSwitchToSignIn }: SignUpFormProps) {
  const { signUp } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<AuthError | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  // Enhanced form validation
  const { validationState, handleFieldChange, handleFieldBlur } = useFormValidation(
    { 
      email: '', 
      password: '', 
      confirmPassword: '', 
      firstName: '', 
      lastName: '', 
      phone: '',
      agreeToTerms: false,
      agreeToMarketing: false
    },
    {
      schema: signUpSchema,
      validateOnChange: true,
      validateOnBlur: true,
    }
  );

  const watchedValues = watch();

  // Update validation state when form values change
  React.useEffect(() => {
    Object.keys(watchedValues).forEach(fieldName => {
      if (watchedValues[fieldName as keyof SignUpFormData] !== undefined) {
        handleFieldChange(fieldName, watchedValues[fieldName as keyof SignUpFormData]);
      }
    });
  }, [watchedValues, handleFieldChange]);

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setAuthError(null);

    try {
              const result = await signUp(data.email, data.password, {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
        });

        if (result.error) {
          const parsedError = parseAuthError(result.error);
          setAuthError(parsedError);
        } else if (result.success) {
          // Redirect to email verification page
          router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          onSuccess?.();
        }
    } catch (error) {
      const parsedError = parseAuthError(error);
      setAuthError(parsedError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    setAuthError(null);
    // Retry the last submission
    if (watchedValues.email && watchedValues.password) {
      onSubmit(watchedValues as SignUpFormData);
    }
  };

  const handleDismissError = () => {
    setAuthError(null);
  };

  const handleInputChange = (field: keyof SignUpFormData, value: any) => {
    setValue(field, value);
    handleFieldChange(field, value);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Create Account</CardTitle>
        <CardDescription className="text-center">
          Join Akwaaba Homes and start your real estate journey
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Error Display */}
          <AuthErrorDisplay
            error={authError}
            onRetry={handleRetry}
            onDismiss={handleDismissError}
            showTechnical={false}
          />

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="First Name"
              placeholder="Enter your first name"
              required
              validation={validationState.firstName}
              error={errors.firstName?.message}
              {...register('firstName', {
                onBlur: (e) => handleFieldBlur('firstName', e.target.value)
              })}
            />
            <FormField
              label="Last Name"
              placeholder="Enter your last name"
              required
              validation={validationState.lastName}
              error={errors.lastName?.message}
              {...register('lastName', {
                onBlur: (e) => handleFieldBlur('lastName', e.target.value)
              })}
            />
          </div>

          {/* Email Field */}
          <FormField
            label="Email Address"
            type="email"
            placeholder="Enter your email address"
            required
            validation={validationState.email}
            error={errors.email?.message}
            helperText="We'll never share your email with anyone else"
            {...register('email', {
              onBlur: (e) => handleFieldBlur('email', e.target.value)
            })}
          />

          {/* Phone Field */}
          <FormField
            label="Phone Number (Optional)"
            type="tel"
            placeholder="Enter your phone number"
            validation={validationState.phone}
            error={errors.phone?.message}
            helperText="For faster communication about properties"
            {...register('phone', {
              onBlur: (e) => handleFieldBlur('phone', e.target.value)
            })}
          />

          {/* Password Field with Strength Meter */}
          <div className="space-y-2">
            <PasswordField
              label="Password"
              placeholder="Create a strong password"
              required
              validation={validationState.password}
              error={errors.password?.message}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
              {...register('password', {
                onBlur: (e) => handleFieldBlur('password', e.target.value)
              })}
            />
            <PasswordStrengthMeter
              password={watchedValues.password || ''}
              onPasswordChange={(newPassword) => setValue('password', newPassword)}
              policy={DEFAULT_PASSWORD_POLICY}
            />
          </div>

          {/* Confirm Password Field */}
          <PasswordField
            label="Confirm Password"
            placeholder="Confirm your password"
            required
            validation={validationState.confirmPassword}
            error={errors.confirmPassword?.message}
            showPassword={showConfirmPassword}
            onTogglePassword={() => setShowConfirmPassword(!showConfirmPassword)}
            {...register('confirmPassword', {
              onBlur: (e) => handleFieldBlur('confirmPassword', e.target.value)
            })}
          />

          {/* Terms and Conditions */}
          <div className="space-y-3">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToTerms"
                checked={watchedValues.agreeToTerms}
                onChange={(e) => 
                  handleInputChange('agreeToTerms', e.target.checked)
                }
                className="mt-1"
              />
              <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  Privacy Policy
                </a>
              </label>
            </div>
            {errors.agreeToTerms && (
              <p className="text-sm text-red-600">{errors.agreeToTerms.message}</p>
            )}

            <div className="flex items-start space-x-2">
              <Checkbox
                id="agreeToMarketing"
                checked={watchedValues.agreeToMarketing}
                onChange={(e) => 
                  handleInputChange('agreeToMarketing', e.target.checked)
                }
                className="mt-1"
              />
              <label htmlFor="agreeToMarketing" className="text-sm text-gray-700 leading-relaxed">
                I agree to receive marketing communications about new properties and updates
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus className="mr-2 h-4 w-4" />
                Create Account
              </>
            )}
          </Button>

          {/* Switch to Sign In */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToSignIn}
                className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-green-600" />
              <span>Your data is protected with enterprise-grade security</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
