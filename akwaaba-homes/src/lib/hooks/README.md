# Frontend Integration System

This directory contains a comprehensive integration system that provides unified access to authentication, loading states, error handling, toast notifications, and API operations throughout the application.

## Overview

The integration system is designed to:
- **Centralize** common functionality across components
- **Standardize** error handling and user feedback
- **Simplify** complex operations with pre-built patterns
- **Ensure** consistent behavior across the application
- **Provide** type-safe interfaces for all operations

## Core Hooks

### 1. `useAppIntegration` - Main Integration Hook

The primary hook that combines all systems into a single interface.

```typescript
import { useAppIntegration } from '@/lib/hooks/useAppIntegration';

const MyComponent = () => {
  const integration = useAppIntegration({
    componentName: 'MyComponent',
    enableAuth: true,
    enableLoading: true,
    enableErrorHandling: true,
    enableToast: true,
    enableApiClient: true,
  });

  // Access all systems
  const { auth, loading, error, toast, api, utils } = integration;
};
```

**Features:**
- **Authentication**: User management, route protection, role-based access
- **Loading**: Progress tracking, multiple operations, automatic cleanup
- **Error Handling**: Comprehensive error processing, security logging, retry logic
- **Toast Notifications**: Consistent user feedback, action buttons, auto-dismiss
- **API Client**: Centralized requests, rate limiting, audit logging
- **Utilities**: Permission checking, action validation, component context

### 2. `useAuthIntegration` - Authentication Management

Handles user authentication, route protection, and role-based access control.

```typescript
import { useAuthIntegration } from '@/lib/hooks/useAuthIntegration';

const MyComponent = () => {
  const { authState, authActions, routeProtection } = useAuthIntegration();

  // Check authentication status
  if (authState.isAuthenticated) {
    // User is logged in
  }

  // Perform authentication actions
  await authActions.signIn(email, password);
  await authActions.signUp(email, password, userType);
  await authActions.signOut();
};
```

**Features:**
- **Route Protection**: Automatic redirection based on authentication and roles
- **Security Logging**: All authentication events are logged for security monitoring
- **Input Validation**: Automatic sanitization and validation of user inputs
- **Role Management**: Built-in permission checking for admin, seller, and agent roles

### 3. `useLoading` - Loading State Management

Manages loading states with progress tracking and automatic cleanup.

```typescript
import { useLoading } from '@/lib/hooks/useLoading';

const MyComponent = () => {
  const loading = useLoading('my-operation');

  // Simple loading
  await loading.withLoading(async () => {
    // Your async operation here
    return result;
  });

  // With progress tracking
  await loading.withProgress(async (progressCallback) => {
    progressCallback(25, 'Processing...');
    // ... operation
    progressCallback(50, 'Almost done...');
    // ... operation
    progressCallback(100, 'Complete!');
    return result;
  });
};
```

**Features:**
- **Global State**: Loading states are shared across components
- **Progress Tracking**: Real-time progress updates with custom messages
- **Automatic Cleanup**: Loading states are automatically cleaned up
- **Batch Operations**: Handle multiple operations with progress tracking
- **Toast Integration**: Automatic loading notifications

### 4. `useErrorIntegration` - Error Handling

Comprehensive error handling with security logging and user feedback.

```typescript
import { useErrorIntegration } from '@/lib/hooks/useErrorIntegration';

const MyComponent = () => {
  const error = useErrorIntegration('MyComponent');

  try {
    // Your operation
  } catch (err) {
    await error.handleError(err, 'operation_name', {
      additionalData: 'context information'
    });
  }

  // Specialized error handlers
  await error.handleNetworkError(err, 'fetch_data');
  await error.handleAuthError(err, 'login_attempt');
  await error.handlePermissionError(err, 'admin_action');
};
```

**Features:**
- **Error Categorization**: Automatic classification of different error types
- **Security Logging**: All errors are logged to the security service
- **User Feedback**: Automatic toast notifications with appropriate styling
- **Retry Logic**: Built-in retry mechanisms for recoverable errors
- **Context Preservation**: Rich error context for debugging

### 5. `useToastIntegration` - Toast Notifications

Comprehensive toast notification system with action buttons and customization.

```typescript
import { useToastIntegration } from '@/lib/hooks/useToastIntegration';

const MyComponent = () => {
  const toast = useToastIntegration('MyComponent');

  // Basic notifications
  toast.showSuccess('Success!', 'Operation completed successfully');
  toast.showError('Error!', 'Something went wrong');
  toast.showWarning('Warning!', 'Please check your input');
  toast.showInfo('Info', 'Here is some information');

  // With actions
  toast.showConfirmationToast(
    'Confirm Action',
    'Are you sure you want to proceed?',
    () => confirmAction(),
    () => cancelAction()
  );

  // Specialized notifications
  toast.showDataOperationToast('create', 'Property', true);
  toast.showSystemNotification('maintenance', 'Scheduled Maintenance', 'System will be unavailable');
};
```

**Features:**
- **Action Buttons**: Interactive toasts with confirm/retry actions
- **Auto-dismiss**: Configurable timing for different notification types
- **Priority Levels**: Different styling for different importance levels
- **Specialized Types**: Pre-built patterns for common use cases
- **Loading Integration**: Automatic loading state notifications

## Specialized Integration Hooks

### 1. `useFormIntegration` - Form Operations

Handles form submission with loading states and error handling.

```typescript
import { useFormIntegration } from '@/lib/hooks/useAppIntegration';

const MyForm = () => {
  const form = useFormIntegration('MyForm');

  const handleSubmit = async (data) => {
    const result = await form.handleFormSubmit(
      'submit-form',
      () => api.submitForm(data),
      'Form submitted successfully!',
      'Form submission failed'
    );
  };

  const handleValidationErrors = (errors) => {
    form.handleValidationErrors(errors);
  };
};
```

### 2. `useDataIntegration` - Data Operations

Manages CRUD operations with consistent feedback.

```typescript
import { useDataIntegration } from '@/lib/hooks/useAppIntegration';

const MyDataComponent = () => {
  const data = useDataIntegration('MyDataComponent');

  const createItem = async () => {
    await data.handleDataOperation(
      'create-item',
      () => api.createItem(itemData),
      'create',
      'Property'
    );
  };

  const batchProcess = async () => {
    await data.handleBatchOperation(
      'batch-process',
      operations,
      'Properties'
    );
  };
};
```

### 3. `useFileIntegration` - File Operations

Handles file uploads and deletions with progress tracking.

```typescript
import { useFileIntegration } from '@/lib/hooks/useAppIntegration';

const MyFileComponent = () => {
  const file = useFileIntegration('MyFileComponent');

  const uploadFile = async (file) => {
    await file.handleFileUpload(
      'upload-file',
      () => api.uploadFile(file),
      file.name
    );
  };
};
```

## Configuration Options

### AppIntegrationConfig

```typescript
interface AppIntegrationConfig {
  componentName: string;           // Required: Component identifier
  enableAuth?: boolean;           // Default: true
  enableLoading?: boolean;        // Default: true
  enableErrorHandling?: boolean;  // Default: true
  enableToast?: boolean;          // Default: true
  enableApiClient?: boolean;      // Default: true
  customRouteConfig?: any;        // Custom route protection rules
  customErrorConfig?: any;        // Custom error handling settings
  customToastConfig?: any;        // Custom toast configurations
}
```

### ErrorHandlingConfig

```typescript
interface ErrorHandlingConfig {
  showToast?: boolean;            // Default: true
  logToSecurity?: boolean;        // Default: true
  retryable?: boolean;            // Default: false
  maxRetries?: number;            // Default: 3
  retryDelay?: number;            // Default: 1000ms
  fallbackMessage?: string;       // Custom fallback message
  onError?: (error: AppError) => void;  // Custom error handler
  onRetry?: () => void;           // Custom retry handler
}
```

### LoadingConfig

```typescript
interface LoadingConfig {
  showProgress?: boolean;         // Default: true
  showToast?: boolean;            // Default: true
  toastMessage?: string;          // Custom toast message
  estimatedDuration?: number;     // Estimated operation duration
  autoHide?: boolean;             // Default: false
  autoHideDelay?: number;         // Delay before auto-hiding
  onComplete?: () => void;        // Completion callback
  onError?: (error: Error) => void; // Error callback
}
```

## Usage Patterns

### 1. Basic Component Integration

```typescript
const MyComponent = () => {
  const integration = useAppIntegration({
    componentName: 'MyComponent'
  });

  const handleAction = async () => {
    try {
      await integration.loading.withLoading('action', async () => {
        const result = await integration.api.post('/api/endpoint', data);
        integration.toast.showSuccess('Success!', 'Action completed');
        return result;
      });
    } catch (error) {
      await integration.error.handleError(error, 'action');
    }
  };
};
```

### 2. Form Component Integration

```typescript
const MyForm = () => {
  const form = useFormIntegration('MyForm');

  const onSubmit = async (data) => {
    const result = await form.handleFormSubmit(
      'submit',
      () => api.submitForm(data),
      'Form submitted successfully!',
      'Form submission failed'
    );

    if (result) {
      // Handle success
    }
  };
};
```

### 3. Data Management Integration

```typescript
const MyDataList = () => {
  const data = useDataIntegration('MyDataList');

  const handleDelete = async (id) => {
    await data.handleDataOperation(
      'delete-item',
      () => api.deleteItem(id),
      'delete',
      'Item'
    );
  };
};
```

### 4. File Upload Integration

```typescript
const MyFileUpload = () => {
  const file = useFileIntegration('MyFileUpload');

  const handleUpload = async (file) => {
    await file.handleFileUpload(
      'upload',
      () => api.uploadFile(file),
      file.name
    );
  };
};
```

## Best Practices

### 1. Component Naming
- Always provide a descriptive `componentName` for proper error tracking
- Use consistent naming conventions across your application

### 2. Error Handling
- Use specific error contexts for better debugging
- Provide meaningful error messages for users
- Log errors with appropriate security levels

### 3. Loading States
- Use descriptive operation keys for loading states
- Provide meaningful progress messages
- Clean up loading states when components unmount

### 4. Toast Notifications
- Use appropriate notification types for different scenarios
- Provide actionable feedback when possible
- Don't overwhelm users with too many notifications

### 5. Authentication
- Check permissions before performing actions
- Use route protection for sensitive pages
- Handle authentication errors gracefully

## Testing

Use the `/test-integration` page to test all integration features:

- **Basic Tests**: Authentication, loading, error handling, toasts
- **Form Tests**: Form submission with validation errors
- **Data Tests**: CRUD operations and batch processing
- **Advanced Tests**: Specialized error handling and notifications

## Security Features

- **Input Sanitization**: Automatic sanitization of user inputs
- **Security Logging**: All operations are logged for monitoring
- **Rate Limiting**: Built-in rate limiting for API requests
- **Permission Checking**: Role-based access control
- **Audit Trail**: Complete audit trail for all operations

## Performance Considerations

- **Memoization**: Hooks use React.memo and useMemo for performance
- **Lazy Loading**: Components are loaded only when needed
- **State Management**: Efficient state updates with minimal re-renders
- **Cleanup**: Automatic cleanup of timers and subscriptions

## Troubleshooting

### Common Issues

1. **Loading states not clearing**: Check if operations are properly awaited
2. **Toast notifications not showing**: Verify toast provider is in the component tree
3. **Authentication errors**: Check if user is properly authenticated
4. **Permission denied**: Verify user has required role/permissions

### Debug Mode

Enable debug mode by setting `NODE_ENV=development` to see detailed logging and test pages.

## Migration Guide

### From Individual Hooks

```typescript
// Before: Using individual hooks
const { toast } = useToast();
const { handleError } = useErrorHandler();
const { withLoading } = useLoading();

// After: Using integration hook
const integration = useAppIntegration({ componentName: 'MyComponent' });
const { toast, error, loading } = integration;
```

### From Custom Error Handling

```typescript
// Before: Manual error handling
try {
  // operation
} catch (error) {
  console.error(error);
  toast.error('Something went wrong');
}

// After: Integrated error handling
try {
  // operation
} catch (error) {
  await integration.error.handleError(error, 'operation_name');
}
```

## Contributing

When adding new features to the integration system:

1. **Follow the existing patterns** for consistency
2. **Add comprehensive TypeScript types** for all new interfaces
3. **Include error handling** for all new operations
4. **Add tests** to the integration test page
5. **Update documentation** for new features

## Support

For questions or issues with the integration system:

1. Check the test page for examples
2. Review the TypeScript types for available options
3. Check the browser console for error messages
4. Verify all required providers are in the component tree
