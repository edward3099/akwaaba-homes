/**
 * Authentication Error Handler
 * Provides user-friendly error messages and categorizes different types of authentication errors
 */

export interface AuthError {
  code: string;
  message: string;
  category: 'validation' | 'network' | 'auth' | 'server' | 'unknown';
  userAction?: string;
  technical?: string;
}

export interface AuthErrorResponse {
  error: string;
  details?: string;
  code?: string;
}

/**
 * Error codes and their user-friendly messages
 */
const ERROR_MESSAGES: Record<string, Omit<AuthError, 'code'>> = {
  // Supabase Auth Errors
  'invalid_credentials': {
    message: 'Invalid email or password. Please check your credentials and try again.',
    category: 'auth',
    userAction: 'Verify your email and password are correct.',
    technical: 'Invalid email/password combination'
  },
  'email_not_confirmed': {
    message: 'Please verify your email address before signing in.',
    category: 'auth',
    userAction: 'Check your email for a verification link, or request a new one.',
    technical: 'User email not confirmed'
  },
  'user_not_found': {
    message: 'No account found with this email address.',
    category: 'auth',
    userAction: 'Check your email address or create a new account.',
    technical: 'User does not exist'
  },
  'weak_password': {
    message: 'Password is too weak. Please choose a stronger password.',
    category: 'validation',
    userAction: 'Use at least 8 characters with a mix of letters, numbers, and symbols.',
    technical: 'Password does not meet security requirements'
  },
  'email_already_in_use': {
    message: 'An account with this email already exists.',
    category: 'auth',
    userAction: 'Try signing in instead, or use a different email address.',
    technical: 'Email already registered'
  },
  'invalid_email': {
    message: 'Please enter a valid email address.',
    category: 'validation',
    userAction: 'Check the format of your email address.',
    technical: 'Invalid email format'
  },
  'too_many_requests': {
    message: 'Too many attempts. Please wait a moment before trying again.',
    category: 'auth',
    userAction: 'Wait a few minutes and try again.',
    technical: 'Rate limit exceeded'
  },
  'expired_action_link': {
    message: 'This link has expired. Please request a new one.',
    category: 'auth',
    userAction: 'Request a new password reset or verification email.',
    technical: 'Action link expired'
  },
  'invalid_action_link': {
    message: 'This link is invalid or has already been used.',
    category: 'auth',
    userAction: 'Request a new password reset or verification email.',
    technical: 'Invalid or used action link'
  },

  // Network Errors
  'network_error': {
    message: 'Connection error. Please check your internet connection and try again.',
    category: 'network',
    userAction: 'Check your internet connection and try again.',
    technical: 'Network request failed'
  },
  'timeout': {
    message: 'Request timed out. Please try again.',
    category: 'network',
    userAction: 'Try again in a moment.',
    technical: 'Request timeout'
  },

  // Server Errors
  'internal_server_error': {
    message: 'Something went wrong on our end. Please try again later.',
    category: 'server',
    userAction: 'Try again in a few minutes.',
    technical: 'Internal server error'
  },
  'service_unavailable': {
    message: 'Service temporarily unavailable. Please try again later.',
    category: 'server',
    userAction: 'Try again in a few minutes.',
    technical: 'Service unavailable'
  },

  // Validation Errors
  'validation_failed': {
    message: 'Please check your input and try again.',
    category: 'validation',
    userAction: 'Review the form and correct any errors.',
    technical: 'Input validation failed'
  },
  'required_field': {
    message: 'Please fill in all required fields.',
    category: 'validation',
    userAction: 'Complete all required fields marked with *.',
    technical: 'Required field missing'
  },
  'password_mismatch': {
    message: 'Passwords do not match. Please try again.',
    category: 'validation',
    userAction: 'Make sure both password fields are identical.',
    technical: 'Password confirmation mismatch'
  },
  'password_too_short': {
    message: 'Password must be at least 8 characters long.',
    category: 'validation',
    userAction: 'Choose a longer password.',
    technical: 'Password length requirement not met'
  },

  // Unknown Errors
  'unknown_error': {
    message: 'An unexpected error occurred. Please try again.',
    category: 'unknown',
    userAction: 'Try again, or contact support if the problem persists.',
    technical: 'Unknown error occurred'
  }
};

/**
 * Parse authentication error from various sources
 */
export function parseAuthError(error: any): AuthError {
  // Handle Supabase AuthError
  if (error?.message && error?.status) {
    const code = error.message.toLowerCase().replace(/\s+/g, '_');
    return {
      code,
      message: ERROR_MESSAGES[code]?.message || error.message,
      category: ERROR_MESSAGES[code]?.category || 'unknown',
      userAction: ERROR_MESSAGES[code]?.userAction,
      technical: ERROR_MESSAGES[code]?.technical || error.message
    };
  }

  // Handle API response errors
  if (error?.error) {
    const code = error.error.toLowerCase().replace(/\s+/g, '_');
    return {
      code,
      message: ERROR_MESSAGES[code]?.message || error.error,
      category: ERROR_MESSAGES[code]?.category || 'unknown',
      userAction: ERROR_MESSAGES[code]?.userAction,
      technical: ERROR_MESSAGES[code]?.technical || error.error
    };
  }

  // Handle network errors
  if (error?.name === 'TypeError' && error?.message.includes('fetch')) {
    return {
      code: 'network_error',
      message: ERROR_MESSAGES.network_error.message,
      category: 'network',
      userAction: ERROR_MESSAGES.network_error.userAction,
      technical: 'Network request failed'
    };
  }

  // Handle validation errors
  if (error?.issues && Array.isArray(error.issues)) {
    return {
      code: 'validation_failed',
      message: 'Please check your input and try again.',
      category: 'validation',
      userAction: 'Review the form and correct any errors.',
      technical: `Validation errors: ${error.issues.map((i: any) => i.message).join(', ')}`
    };
  }

  // Handle generic errors
  if (error?.message) {
    return {
      code: 'unknown_error',
      message: error.message,
      category: 'unknown',
      userAction: 'Try again, or contact support if the problem persists.',
      technical: error.message
    };
  }

  // Fallback for unknown errors
  return {
    code: 'unknown_error',
    message: ERROR_MESSAGES.unknown_error.message,
    category: 'unknown',
    userAction: ERROR_MESSAGES.unknown_error.userAction,
    technical: 'Unknown error occurred'
  };
}

/**
 * Get error category color for UI
 */
export function getErrorCategoryColor(category: AuthError['category']): string {
  switch (category) {
    case 'validation':
      return 'border-yellow-200 bg-yellow-50 text-yellow-800';
    case 'network':
      return 'border-orange-200 bg-orange-50 text-orange-800';
    case 'auth':
      return 'border-red-200 bg-red-50 text-red-800';
    case 'server':
      return 'border-purple-200 bg-purple-50 text-purple-800';
    case 'unknown':
    default:
      return 'border-gray-200 bg-gray-50 text-gray-800';
  }
}

/**
 * Get error category icon
 */
export function getErrorCategoryIcon(category: AuthError['category']): string {
  switch (category) {
    case 'validation':
      return 'AlertTriangle';
    case 'network':
      return 'WifiOff';
    case 'auth':
      return 'Shield';
    case 'server':
      return 'Server';
    case 'unknown':
    default:
      return 'AlertCircle';
  }
}

/**
 * Format validation errors for display
 */
export function formatValidationErrors(errors: any[]): string[] {
  return errors.map(error => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.path && error?.message) return `${error.path}: ${error.message}`;
    return 'Invalid input';
  });
}

/**
 * Check if error is retryable
 */
export function isRetryableError(error: AuthError): boolean {
  return ['network', 'server', 'timeout'].includes(error.category);
}

/**
 * Get retry delay for error
 */
export function getRetryDelay(error: AuthError): number {
  switch (error.code) {
    case 'too_many_requests':
      return 60000; // 1 minute
    case 'timeout':
      return 5000; // 5 seconds
    case 'network_error':
      return 10000; // 10 seconds
    default:
      return 0; // No retry
  }
}
