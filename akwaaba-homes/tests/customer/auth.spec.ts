import { test, expect } from '@playwright/test';
import { BasePage } from '../shared/BasePage';

class AuthPage extends BasePage {
  // Locators
  readonly emailInput = () => this.page.locator('[data-testid="email"]');
  readonly passwordInput = () => this.page.locator('[data-testid="password"]');
  readonly loginButton = () => this.page.locator('[data-testid="login-button"]');
  readonly registerButton = () => this.page.locator('[data-testid="register-button"]');
  readonly forgotPasswordLink = () => this.page.locator('[data-testid="forgot-password-link"]');
  readonly errorMessage = () => this.page.locator('[data-testid="error-message"]');
  readonly successMessage = () => this.page.locator('[data-testid="success-message"]');
  readonly logoutButton = () => this.page.locator('[data-testid="logout-button"]');
  readonly userMenu = () => this.page.locator('[data-testid="user-menu"]');
  readonly profileLink = () => this.page.locator('[data-testid="profile-link"]');

  /**
   * Navigate to login page
   */
  async navigateToLogin() {
    await this.goto('/login');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to registration page
   */
  async navigateToRegister() {
    await this.goto('/register');
    await this.waitForPageLoad();
  }

  /**
   * Fill login form
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
  }

  /**
   * Submit login form
   */
  async submitLogin() {
    await this.loginButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Fill registration form
   */
  async fillRegistrationForm(email: string, password: string, confirmPassword: string, name: string) {
    await this.page.locator('[data-testid="name"]').fill(name);
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.page.locator('[data-testid="confirm-password"]').fill(confirmPassword);
  }

  /**
   * Submit registration form
   */
  async submitRegistration() {
    await this.registerButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Check if user is logged in
   */
  async isLoggedIn(): Promise<boolean> {
    return await this.userMenu().isVisible();
  }

  /**
   * Logout user
   */
  async logout() {
    await this.userMenu().click();
    await this.logoutButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Navigate to forgot password
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink().click();
    await this.waitForPageLoad();
  }
}

test.describe('User Authentication', () => {
  let authPage: AuthPage;

  test.beforeEach(async ({ page }) => {
    authPage = new AuthPage(page);
  });

  test.describe('Login Flow', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
    });

    test('should display login form', async ({ page }) => {
      // Verify form elements are visible
      await expect(authPage.emailInput()).toBeVisible();
      await expect(authPage.passwordInput()).toBeVisible();
      await expect(authPage.loginButton()).toBeVisible();
      await expect(authPage.forgotPasswordLink()).toBeVisible();
    });

    test('should login with valid credentials', async ({ page }) => {
      // Fill login form with test credentials
      await authPage.fillLoginForm('test-customer@akwaabahomes.com', 'testpassword123');
      
      // Submit form
      await authPage.submitLogin();
      
      // Verify successful login
      await expect(authPage.userMenu()).toBeVisible();
      
      // Verify redirect to dashboard
      await authPage.expectURLContains('dashboard');
    });

    test('should show error with invalid credentials', async ({ page }) => {
      // Fill login form with invalid credentials
      await authPage.fillLoginForm('invalid@email.com', 'wrongpassword');
      
      // Submit form
      await authPage.submitLogin();
      
      // Verify error message is displayed
      await expect(authPage.errorMessage()).toBeVisible();
      
      // Verify user is not logged in
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
    });

    test('should show error with empty fields', async ({ page }) => {
      // Submit empty form
      await authPage.submitLogin();
      
      // Verify error message is displayed
      await expect(authPage.errorMessage()).toBeVisible();
    });

    test('should navigate to forgot password page', async ({ page }) => {
      // Click forgot password link
      await authPage.goToForgotPassword();
      
      // Verify navigation to forgot password page
      await authPage.expectURLContains('forgot-password');
    });
  });

  test.describe('Registration Flow', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToRegister();
    });

    test('should display registration form', async ({ page }) => {
      // Verify form elements are visible
      await expect(authPage.page.locator('[data-testid="name"]')).toBeVisible();
      await expect(authPage.emailInput()).toBeVisible();
      await expect(authPage.passwordInput()).toBeVisible();
      await expect(authPage.page.locator('[data-testid="confirm-password"]')).toBeVisible();
      await expect(authPage.registerButton()).toBeVisible();
    });

    test('should register with valid information', async ({ page }) => {
      const testEmail = `test-${Date.now()}@akwaabahomes.com`;
      
      // Fill registration form
      await authPage.fillRegistrationForm(
        testEmail,
        'TestPassword123!',
        'TestPassword123!',
        'Test User'
      );
      
      // Submit form
      await authPage.submitRegistration();
      
      // Verify successful registration
      await expect(authPage.successMessage()).toBeVisible();
      
      // Verify redirect to login or dashboard
      const currentURL = await authPage.getCurrentURL();
      expect(currentURL.includes('login') || currentURL.includes('dashboard')).toBe(true);
    });

    test('should show error with password mismatch', async ({ page }) => {
      // Fill registration form with mismatched passwords
      await authPage.fillRegistrationForm(
        'test@example.com',
        'Password123!',
        'DifferentPassword123!',
        'Test User'
      );
      
      // Submit form
      await authPage.submitRegistration();
      
      // Verify error message is displayed
      await expect(authPage.errorMessage()).toBeVisible();
    });

    test('should show error with weak password', async ({ page }) => {
      // Fill registration form with weak password
      await authPage.fillRegistrationForm(
        'test@example.com',
        '123',
        '123',
        'Test User'
      );
      
      // Submit form
      await authPage.submitRegistration();
      
      // Verify error message is displayed
      await expect(authPage.errorMessage()).toBeVisible();
    });

    test('should show error with invalid email', async ({ page }) => {
      // Fill registration form with invalid email
      await authPage.fillRegistrationForm(
        'invalid-email',
        'TestPassword123!',
        'TestPassword123!',
        'Test User'
      );
      
      // Submit form
      await authPage.submitRegistration();
      
      // Verify error message is displayed
      await expect(authPage.errorMessage()).toBeVisible();
    });
  });

  test.describe('Logout Flow', () => {
    test.beforeEach(async ({ page }) => {
      // Login first
      await authPage.navigateToLogin();
      await authPage.fillLoginForm('test-customer@akwaabahomes.com', 'testpassword123');
      await authPage.submitLogin();
      
      // Verify login was successful
      await expect(authPage.userMenu()).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
      // Logout
      await authPage.logout();
      
      // Verify user is logged out
      const isLoggedIn = await authPage.isLoggedIn();
      expect(isLoggedIn).toBe(false);
      
      // Verify redirect to home or login page
      const currentURL = await authPage.getCurrentURL();
      expect(currentURL.includes('login') || currentURL.includes('/')).toBe(true);
    });
  });

  test.describe('Form Validation', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
    });

    test('should validate email format', async ({ page }) => {
      // Try invalid email formats
      const invalidEmails = ['test', 'test@', '@test.com', 'test..test@example.com'];
      
      for (const email of invalidEmails) {
        await authPage.emailInput().fill(email);
        await authPage.passwordInput().fill('password123');
        await authPage.submitLogin();
        
        // Verify error message is displayed
        await expect(authPage.errorMessage()).toBeVisible();
      }
    });

    test('should handle special characters in password', async ({ page }) => {
      // Test password with special characters
      const specialPassword = 'Test@Password#123$';
      
      await authPage.emailInput().fill('test@example.com');
      await authPage.passwordInput().fill(specialPassword);
      await authPage.submitLogin();
      
      // Should not crash and should show appropriate error for invalid credentials
      await expect(authPage.errorMessage()).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test.beforeEach(async ({ page }) => {
      await authPage.navigateToLogin();
    });

    test('should have proper form labels', async ({ page }) => {
      // Verify form fields have proper labels
      await expect(authPage.page.locator('label[for="email"]')).toBeVisible();
      await expect(authPage.page.locator('label[for="password"]')).toBeVisible();
    });

    test('should support keyboard navigation', async ({ page }) => {
      // Navigate through form using Tab key
      await authPage.emailInput().focus();
      await page.keyboard.press('Tab');
      
      // Verify focus moves to password field
      await expect(authPage.passwordInput()).toBeFocused();
      
      await page.keyboard.press('Tab');
      
      // Verify focus moves to login button
      await expect(authPage.loginButton()).toBeFocused();
    });
  });
});
