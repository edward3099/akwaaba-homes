export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export class AppError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export function handleApiError(error: any): ApiError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      status: error.status,
      details: error.details
    };
  }

  if (error?.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      code: error.response.data.code || 'API_ERROR',
      status: error.response.status,
      details: error.response.data
    };
  }

  if (error?.message) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500
  };
}

export function isNetworkError(error: any): boolean {
  return error?.code === 'NETWORK_ERROR' || 
         error?.message?.includes('Network Error') ||
         error?.message?.includes('fetch');
}

export function isAuthError(error: any): boolean {
  return error?.status === 401 || 
         error?.status === 403 ||
         error?.code === 'UNAUTHORIZED' ||
         error?.code === 'FORBIDDEN';
}

export function getErrorMessage(error: any): string {
  const apiError = handleApiError(error);
  return apiError.message;
}

export function logError(error: any, context?: string) {
  const apiError = handleApiError(error);
  console.error(`[${context || 'App'}] Error:`, {
    message: apiError.message,
    code: apiError.code,
    status: apiError.status,
    details: apiError.details,
    timestamp: new Date().toISOString()
  });
}

