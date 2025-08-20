/**
 * Format dates consistently across server and client to prevent hydration mismatches
 */

export function formatDate(dateString: string | Date, options?: {
  includeTime?: boolean;
  format?: 'short' | 'medium' | 'long';
}): string {
  const date = new Date(dateString);
  
  // Use explicit locale and options to ensure consistency
  const baseOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC' // Use UTC to prevent timezone mismatches
  };

  if (options?.includeTime) {
    baseOptions.hour = '2-digit';
    baseOptions.minute = '2-digit';
  }

  if (options?.format === 'long') {
    baseOptions.month = 'long';
    baseOptions.weekday = 'long';
  } else if (options?.format === 'medium') {
    baseOptions.month = 'long';
  }

  return date.toLocaleDateString('en-US', baseOptions);
}

export function formatRelativeTime(dateString: string | Date): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  } else if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  } else if (diffInDays < 365) {
    const months = Math.floor(diffInDays / 30);
    return `${months} month${months > 1 ? 's' : ''} ago`;
  } else {
    const years = Math.floor(diffInDays / 365);
    return `${years} year${years > 1 ? 's' : ''} ago`;
  }
}

export function formatDateISO(date: Date | string): string {
  return new Date(date).toISOString().split('T')[0];
}
