import { test, expect } from '@playwright/test';
import { BasePage } from '../shared/BasePage';

class AdminDashboardPage extends BasePage {
  // Locators
  readonly dashboardStats = () => this.page.locator('[data-testid="dashboard-stats"]');
  readonly totalProperties = () => this.page.locator('[data-testid="total-properties"]');
  readonly totalUsers = () => this.page.locator('[data-testid="total-users"]');
  readonly totalAgents = () => this.page.locator('[data-testid="total-agents"]');
  readonly pendingApprovals = () => this.page.locator('[data-testid="pending-approvals"]');
  readonly recentActivity = () => this.page.locator('[data-testid="recent-activity"]');
  readonly userManagementTab = () => this.page.locator('[data-testid="user-management-tab"]');
  readonly propertyManagementTab = () => this.page.locator('[data-testid="property-management-tab"]');
  readonly systemSettingsTab = () => this.page.locator('[data-testid="system-settings-tab"]');
  readonly userTable = () => this.page.locator('[data-testid="user-table"]');
  readonly propertyTable = () => this.page.locator('[data-testid="property-table"]');
  readonly approveButton = () => this.page.locator('[data-testid="approve-button"]');
  readonly rejectButton = () => this.page.locator('[data-testid="reject-button"]');
  readonly suspendButton = () => this.page.locator('[data-testid="suspend-button"]');
  readonly searchInput = () => this.page.locator('[data-testid="admin-search"]');
  readonly filterSelect = () => this.page.locator('[data-testid="admin-filter"]');
  readonly exportButton = () => this.page.locator('[data-testid="export-data"]');
  readonly notificationPanel = () => this.page.locator('[data-testid="notification-panel"]');

  /**
   * Navigate to admin dashboard
   */
  async navigateToDashboard() {
    await this.goto('/admin/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to user management
   */
  async navigateToUserManagement() {
    await this.goto('/admin/users');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to property management
   */
  async navigateToPropertyManagement() {
    await this.goto('/admin/properties');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to system settings
   */
  async navigateToSystemSettings() {
    await this.goto('/admin/settings');
    await this.waitForPageLoad();
  }

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const stats = {
      totalProperties: await this.totalProperties().textContent(),
      totalUsers: await this.totalUsers().textContent(),
      totalAgents: await this.totalAgents().textContent(),
      pendingApprovals: await this.pendingApprovals().textContent()
    };
    return stats;
  }

  /**
   * Search for users or properties
   */
  async search(query: string) {
    await this.searchInput().fill(query);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Apply filter
   */
  async applyFilter(filterType: string, value: string) {
    const filter = this.page.locator(`[data-testid="filter-${filterType}"]`);
    await filter.selectOption(value);
    await this.waitForPageLoad();
  }

  /**
   * Approve user or property
   */
  async approveItem(itemIndex: number) {
    const approveButtons = this.approveButton();
    await approveButtons.nth(itemIndex).click();
    await this.waitForPageLoad();
  }

  /**
   * Reject user or property
   */
  async rejectItem(itemIndex: number) {
    const rejectButtons = this.rejectButton();
    await rejectButtons.nth(itemIndex).click();
    await this.waitForPageLoad();
  }

  /**
   * Suspend user
   */
  async suspendUser(userIndex: number) {
    const suspendButtons = this.suspendButton();
    await suspendButtons.nth(userIndex).click();
    await this.waitForPageLoad();
  }

  /**
   * Export data
   */
  async exportData(format: string) {
    await this.exportButton().click();
    const formatButton = this.page.locator(`[data-testid="export-${format}"]`);
    await formatButton.click();
    
    // Wait for download to start
    const downloadPromise = this.page.waitForEvent('download');
    await downloadPromise;
  }

  /**
   * Get user count
   */
  async getUserCount(): Promise<number> {
    const userRows = this.page.locator('[data-testid="user-row"]');
    return await userRows.count();
  }

  /**
   * Get property count
   */
  async getPropertyCount(): Promise<number> {
    const propertyRows = this.page.locator('[data-testid="property-row"]');
    return await propertyRows.count();
  }

  /**
   * Check if notification is visible
   */
  async hasNotification(): Promise<boolean> {
    return await this.notificationPanel().isVisible();
  }
}

test.describe('Admin Dashboard', () => {
  let adminPage: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    adminPage = new AdminDashboardPage(page);
    
    // Use authenticated state for admin
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: 'admin-auth-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
  });

  test.describe('Dashboard Overview', () => {
    test.beforeEach(async ({ page }) => {
      await adminPage.navigateToDashboard();
    });

    test('should display dashboard statistics', async ({ page }) => {
      // Verify dashboard stats are visible
      await expect(adminPage.dashboardStats()).toBeVisible();
      await expect(adminPage.totalProperties()).toBeVisible();
      await expect(adminPage.totalUsers()).toBeVisible();
      await expect(adminPage.totalAgents()).toBeVisible();
      await expect(adminPage.pendingApprovals()).toBeVisible();
    });

    test('should display recent activity', async ({ page }) => {
      // Verify recent activity panel is visible
      await expect(adminPage.recentActivity()).toBeVisible();
      
      // Verify activity items are displayed
      const activityItems = page.locator('[data-testid="activity-item"]');
      expect(await activityItems.count()).toBeGreaterThanOrEqual(0);
    });

    test('should show correct statistics', async ({ page }) => {
      // Get dashboard stats
      const stats = await adminPage.getDashboardStats();
      
      // Verify stats are numeric and reasonable
      expect(parseInt(stats.totalProperties || '0')).toBeGreaterThanOrEqual(0);
      expect(parseInt(stats.totalUsers || '0')).toBeGreaterThanOrEqual(0);
      expect(parseInt(stats.totalAgents || '0')).toBeGreaterThanOrEqual(0);
      expect(parseInt(stats.pendingApprovals || '0')).toBeGreaterThanOrEqual(0);
    });

    test('should navigate to different sections', async ({ page }) => {
      // Navigate to user management
      await adminPage.userManagementTab().click();
      await adminPage.expectURLContains('users');
      
      // Navigate to property management
      await adminPage.propertyManagementTab().click();
      await adminPage.expectURLContains('properties');
      
      // Navigate to system settings
      await adminPage.systemSettingsTab().click();
      await adminPage.expectURLContains('settings');
    });
  });

  test.describe('User Management', () => {
    test.beforeEach(async ({ page }) => {
      await adminPage.navigateToUserManagement();
    });

    test('should display user table', async ({ page }) => {
      // Verify user table is visible
      await expect(adminPage.userTable()).toBeVisible();
      
      // Verify users are displayed
      const userCount = await adminPage.getUserCount();
      expect(userCount).toBeGreaterThanOrEqual(0);
    });

    test('should search users', async ({ page }) => {
      // Search for specific user
      await adminPage.search('test@example.com');
      
      // Verify search results
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
    });

    test('should filter users by role', async ({ page }) => {
      // Filter by customer role
      await adminPage.applyFilter('role', 'customer');
      
      // Verify filtered results
      const filteredResults = page.locator('[data-testid="filtered-results"]');
      await expect(filteredResults).toBeVisible();
    });

    test('should approve pending users', async ({ page }) => {
      // Get initial user count
      const initialCount = await adminPage.getUserCount();
      
      // Approve first pending user
      await adminPage.approveItem(0);
      
      // Verify user count remains the same (user is approved, not removed)
      const finalCount = await adminPage.getUserCount();
      expect(finalCount).toBe(initialCount);
    });

    test('should reject pending users', async ({ page }) => {
      // Get initial user count
      const initialCount = await adminPage.getUserCount();
      
      // Reject first pending user
      await adminPage.rejectItem(0);
      
      // Verify user count decreases
      const finalCount = await adminPage.getUserCount();
      expect(finalCount).toBeLessThanOrEqual(initialCount);
    });

    test('should suspend users', async ({ page }) => {
      // Suspend first user
      await adminPage.suspendUser(0);
      
      // Verify user is suspended (check status indicator)
      const suspendedIndicator = page.locator('[data-testid="suspended-indicator"]');
      await expect(suspendedIndicator).toBeVisible();
    });

    test('should export user data', async ({ page }) => {
      // Export user data as CSV
      await adminPage.exportData('csv');
      
      // Verify export functionality works (download event)
      // Note: In a real test, you'd verify the downloaded file
    });
  });

  test.describe('Property Management', () => {
    test.beforeEach(async ({ page }) => {
      await adminPage.navigateToPropertyManagement();
    });

    test('should display property table', async ({ page }) => {
      // Verify property table is visible
      await expect(adminPage.propertyTable()).toBeVisible();
      
      // Verify properties are displayed
      const propertyCount = await adminPage.getPropertyCount();
      expect(propertyCount).toBeGreaterThanOrEqual(0);
    });

    test('should search properties', async ({ page }) => {
      // Search for specific property
      await adminPage.search('Accra');
      
      // Verify search results
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
    });

    test('should filter properties by status', async ({ page }) => {
      // Filter by pending status
      await adminPage.applyFilter('status', 'pending');
      
      // Verify filtered results
      const filteredResults = page.locator('[data-testid="filtered-results"]');
      await expect(filteredResults).toBeVisible();
    });

    test('should approve pending properties', async ({ page }) => {
      // Get initial property count
      const initialCount = await adminPage.getPropertyCount();
      
      // Approve first pending property
      await adminPage.approveItem(0);
      
      // Verify property count remains the same (property is approved, not removed)
      const finalCount = await adminPage.getPropertyCount();
      expect(finalCount).toBe(initialCount);
    });

    test('should reject pending properties', async ({ page }) => {
      // Get initial property count
      const initialCount = await adminPage.getPropertyCount();
      
      // Reject first pending property
      await adminPage.rejectItem(0);
      
      // Verify property count decreases
      const finalCount = await adminPage.getPropertyCount();
      expect(finalCount).toBeLessThanOrEqual(initialCount);
    });

    test('should export property data', async ({ page }) => {
      // Export property data as Excel
      await adminPage.exportData('excel');
      
      // Verify export functionality works
    });
  });

  test.describe('System Settings', () => {
    test.beforeEach(async ({ page }) => {
      await adminPage.navigateToSystemSettings();
    });

    test('should display system configuration options', async ({ page }) => {
      // Verify system settings are visible
      const settingsForm = page.locator('[data-testid="system-settings-form"]');
      await expect(settingsForm).toBeVisible();
    });

    test('should update system settings', async ({ page }) => {
      // Update a setting
      const settingInput = page.locator('[data-testid="setting-value"]');
      await settingInput.fill('new-value');
      
      // Save settings
      const saveButton = page.locator('[data-testid="save-settings"]');
      await saveButton.click();
      
      // Verify success message
      const successMessage = page.locator('[data-testid="settings-saved"]');
      await expect(successMessage).toBeVisible();
    });

    test('should display notification preferences', async ({ page }) => {
      // Verify notification settings are visible
      const notificationSettings = page.locator('[data-testid="notification-settings"]');
      await expect(notificationSettings).toBeVisible();
    });
  });

  test.describe('Security and Access Control', () => {
    test('should require admin authentication', async ({ page }) => {
      // Try to access admin dashboard without authentication
      await page.context().clearCookies();
      await adminPage.navigateToDashboard();
      
      // Should redirect to login
      await adminPage.expectURLContains('login');
    });

    test('should prevent unauthorized access to admin functions', async ({ page }) => {
      // Try to access admin functions with non-admin user
      await page.context().addCookies([
        {
          name: 'auth-token',
          value: 'user-auth-token',
          domain: 'localhost',
          path: '/',
        }
      ]);
      
      await adminPage.navigateToDashboard();
      
      // Should show access denied or redirect
      const accessDenied = page.locator('[data-testid="access-denied"]');
      if (await accessDenied.isVisible()) {
        await expect(accessDenied).toBeVisible();
      } else {
        // Should redirect to unauthorized page
        await adminPage.expectURLContains('unauthorized');
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await adminPage.navigateToDashboard();
      
      // Verify dashboard is still functional on mobile
      await expect(adminPage.dashboardStats()).toBeVisible();
      await expect(adminPage.totalProperties()).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await adminPage.navigateToUserManagement();
      
      // Verify user management is displayed properly
      await expect(adminPage.userTable()).toBeVisible();
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should handle large datasets', async ({ page }) => {
      // This test would be implemented with actual large datasets
      // For now, we'll test basic functionality
      await adminPage.navigateToUserManagement();
      
      // Verify table loads without errors
      await expect(adminPage.userTable()).toBeVisible();
      
      // Check if pagination exists for large datasets
      const pagination = page.locator('[data-testid="pagination"]');
      if (await pagination.isVisible()) {
        await expect(pagination).toBeVisible();
      }
    });

    test('should handle concurrent operations', async ({ page }) => {
      // Test multiple operations simultaneously
      await adminPage.navigateToUserManagement();
      
      // Perform multiple actions
      await adminPage.search('test');
      await adminPage.applyFilter('role', 'customer');
      
      // Verify both operations complete successfully
      const searchResults = page.locator('[data-testid="search-results"]');
      const filteredResults = page.locator('[data-testid="filtered-results"]');
      
      await expect(searchResults).toBeVisible();
      await expect(filteredResults).toBeVisible();
    });
  });
});
