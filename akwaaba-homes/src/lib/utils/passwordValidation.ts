/**
 * Password Validation Utility
 * Implements comprehensive password strength validation based on modern security best practices
 */

export interface PasswordStrength {
  score: number; // 0-4 (0 = very weak, 4 = very strong)
  feedback: string[];
  suggestions: string[];
  meetsRequirements: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumbers: boolean;
    hasSpecialChars: boolean;
    noCommonPatterns: boolean;
    noPersonalInfo: boolean;
  };
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  minScore: number; // Minimum zxcvbn score (0-4)
  maxAge?: number; // Maximum password age in days
  preventReuse?: number; // Number of previous passwords to prevent reuse
}

// Default password policy for real estate applications
export const DEFAULT_PASSWORD_POLICY: PasswordPolicy = {
  minLength: 12,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  minScore: 3, // Require at least "strong" password
  maxAge: 90, // 90 days
  preventReuse: 5, // Prevent reuse of last 5 passwords
};

// Common weak passwords and patterns to avoid
const COMMON_PASSWORDS = new Set([
  'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
  'admin', 'letmein', 'welcome', 'monkey', 'dragon', 'master', 'sunshine',
  'princess', 'qwertyuiop', 'admin123', 'welcome123', 'login', 'passw0rd',
  'abc123', '111111', '123123', 'admin123', 'password1', '12345678',
  'qwerty123', '1234567890', '1234567', 'qwertyui', '555555', 'lovely',
  'hello123', 'freedom', 'whatever', 'qazwsx', 'trustno1', 'jordan',
  'harley', 'hunter', 'buster', 'thomas', 'tigger', 'robert', 'soccer',
  'batman', 'test', 'pass', 'admin', '123', 'guest', 'info', 'adm',
  'mysql', 'user', 'administrator', 'root', 'demo', 'test123', 'guest123'
]);

// Common patterns to avoid
const COMMON_PATTERNS = [
  /^12345/, /^qwert/, /^asdfg/, /^zxcvb/, /^password/i, /^admin/i,
  /^test/i, /^demo/i, /^guest/i, /^user/i, /^root/i, /^123456/,
  /^abcdef/, /^qwerty/, /^asdfgh/, /^zxcvbn/, /^123123/, /^111111/,
  /^000000/, /^999999/, /^888888/, /^777777/, /^666666/, /^555555/,
  /^444444/, /^333333/, /^222222/, /^111111/, /^000000/
];

/**
 * Check if password contains personal information patterns
 */
function containsPersonalInfo(password: string, userData?: { email?: string; name?: string }): boolean {
  if (!userData) return false;
  
  const lowerPassword = password.toLowerCase();
  
  // Check for email patterns
  if (userData.email) {
    const emailParts = userData.email.toLowerCase().split('@')[0];
    if (emailParts && lowerPassword.includes(emailParts)) {
      return true;
    }
  }
  
  // Check for name patterns
  if (userData.name) {
    const nameParts = userData.name.toLowerCase().split(' ');
    for (const part of nameParts) {
      if (part.length > 2 && lowerPassword.includes(part)) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Calculate password strength score (0-4)
 * 0: Very weak, 1: Weak, 2: Fair, 3: Strong, 4: Very strong
 */
function calculateStrengthScore(password: string): number {
  let score = 0;
  
  // Length contribution
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  
  // Character variety contribution
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChars = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  const charVariety = [hasUppercase, hasLowercase, hasNumbers, hasSpecialChars].filter(Boolean).length;
  if (charVariety >= 3) score += 1;
  if (charVariety === 4) score += 1;
  
  // Entropy contribution
  const uniqueChars = new Set(password).size;
  if (uniqueChars >= password.length * 0.6) score += 1;
  
  // Penalize common patterns
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    score = Math.max(0, score - 2);
  }
  
  // Penalize sequential patterns
  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    score = Math.max(0, score - 1);
  }
  
  // Penalize repeated characters
  if (/(.)\1{2,}/.test(password)) {
    score = Math.max(0, score - 1);
  }
  
  // Penalize keyboard patterns
  if (/qwerty|asdfg|zxcvb/i.test(password)) {
    score = Math.max(0, score - 1);
  }
  
  return Math.min(4, Math.max(0, score));
}

/**
 * Generate feedback messages based on password analysis
 */
function generateFeedback(password: string, score: number): string[] {
  const feedback: string[] = [];
  
  if (score <= 1) {
    feedback.push('This password is very weak and easily guessable.');
  } else if (score <= 2) {
    feedback.push('This password could be stronger.');
  }
  
  if (password.length < 8) {
    feedback.push('Password should be at least 8 characters long.');
  } else if (password.length < 12) {
    feedback.push('Consider using at least 12 characters for better security.');
  }
  
  if (!/[A-Z]/.test(password)) {
    feedback.push('Add uppercase letters to increase strength.');
  }
  
  if (!/[a-z]/.test(password)) {
    feedback.push('Add lowercase letters to increase strength.');
  }
  
  if (!/\d/.test(password)) {
    feedback.push('Include numbers to make the password stronger.');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    feedback.push('Add special characters for enhanced security.');
  }
  
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    feedback.push('This is a commonly used password. Choose something unique.');
  }
  
  if (/123|abc|qwe|asd|zxc/i.test(password)) {
    feedback.push('Avoid sequential patterns like "123" or "abc".');
  }
  
  if (/(.)\1{2,}/.test(password)) {
    feedback.push('Avoid repeating the same character multiple times.');
  }
  
  return feedback;
}

/**
 * Generate suggestions for improving password strength
 */
function generateSuggestions(password: string, score: number): string[] {
  const suggestions: string[] = [];
  
  if (score < 3) {
    suggestions.push('Consider using a passphrase instead of a single word.');
    suggestions.push('Mix uppercase and lowercase letters randomly.');
    suggestions.push('Replace some letters with numbers or symbols.');
    suggestions.push('Avoid using personal information like names or birthdays.');
  }
  
  if (password.length < 12) {
    suggestions.push('Make your password longer by adding more characters.');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    suggestions.push('Try substituting letters with similar-looking symbols (e.g., @ for a, 3 for e).');
  }
  
  if (COMMON_PASSWORDS.has(password.toLowerCase())) {
    suggestions.push('Think of a unique word or phrase that means something to you.');
  }
  
  return suggestions;
}

/**
 * Validate password against policy requirements
 */
function validateRequirements(password: string, policy: PasswordPolicy): PasswordStrength['requirements'] {
  return {
    minLength: password.length >= policy.minLength,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumbers: /\d/.test(password),
    hasSpecialChars: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    noCommonPatterns: !COMMON_PASSWORDS.has(password.toLowerCase()) && 
                      !COMMON_PATTERNS.some(pattern => pattern.test(password)),
    noPersonalInfo: true, // Will be checked separately with user data
  };
}

/**
 * Main password validation function
 */
export function validatePassword(
  password: string, 
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY,
  userData?: { email?: string; name?: string }
): PasswordStrength {
  // Check for personal information
  const containsPersonal = containsPersonalInfo(password, userData);
  
  // Calculate strength score
  const score = calculateStrengthScore(password);
  
  // Validate requirements
  const requirements = validateRequirements(password, policy);
  requirements.noPersonalInfo = !containsPersonal;
  
  // Generate feedback and suggestions
  const feedback = generateFeedback(password, score);
  const suggestions = generateSuggestions(password, score);
  
  // Check if password meets all requirements
  const meetsRequirements = 
    requirements.minLength &&
    (!policy.requireUppercase || requirements.hasUppercase) &&
    (!policy.requireLowercase || requirements.hasLowercase) &&
    (!policy.requireNumbers || requirements.hasNumbers) &&
    (!policy.requireSpecialChars || requirements.hasSpecialChars) &&
    requirements.noCommonPatterns &&
    requirements.noPersonalInfo &&
    score >= policy.minScore;
  
  return {
    score,
    feedback,
    suggestions,
    meetsRequirements,
    requirements,
  };
}

/**
 * Get password strength label
 */
export function getPasswordStrengthLabel(score: number): string {
  switch (score) {
    case 0: return 'Very Weak';
    case 1: return 'Weak';
    case 2: return 'Fair';
    case 3: return 'Strong';
    case 4: return 'Very Strong';
    default: return 'Unknown';
  }
}

/**
 * Get password strength color for UI
 */
export function getPasswordStrengthColor(score: number): string {
  switch (score) {
    case 0: return 'text-red-600';
    case 1: return 'text-orange-600';
    case 2: return 'text-yellow-600';
    case 3: return 'text-blue-600';
    case 4: return 'text-green-600';
    default: return 'text-gray-600';
  }
}

/**
 * Check if password meets minimum policy requirements
 */
export function isPasswordAcceptable(
  password: string, 
  policy: PasswordPolicy = DEFAULT_PASSWORD_POLICY
): boolean {
  const validation = validatePassword(password, policy);
  return validation.meetsRequirements;
}

/**
 * Generate a secure password suggestion
 */
export function generateSecurePassword(length: number = 16): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
  let password = '';
  
  // Ensure at least one character from each required category
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Uppercase
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Lowercase
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Number
  password += '!@#$%^&*()_+-=[]{}|;:,.<>?'[Math.floor(Math.random() * 32)]; // Special
  
  // Fill the rest randomly
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

