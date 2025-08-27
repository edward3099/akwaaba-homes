import { test, expect } from '@playwright/test';
import { BasePage } from '../shared/BasePage';

class AgentPropertyPage extends BasePage {
  // Locators
  readonly addPropertyButton = () => this.page.locator('[data-testid="add-property-button"]');
  readonly propertyForm = () => this.page.locator('[data-testid="property-form"]');
  readonly titleInput = () => this.page.locator('[data-testid="property-title"]');
  readonly descriptionInput = () => this.page.locator('[data-testid="property-description"]');
  readonly priceInput = () => this.page.locator('[data-testid="property-price"]');
  readonly locationInput = () => this.page.locator('[data-testid="property-location"]');
  readonly bedroomsInput = () => this.page.locator('[data-testid="property-bedrooms"]');
  readonly bathroomsInput = () => this.page.locator('[data-testid="property-bathrooms"]');
  readonly areaInput = () => this.page.locator('[data-testid="property-area"]');
  readonly submitButton = () => this.page.locator('[data-testid="submit-property"]');
  readonly successMessage = () => this.page.locator('[data-testid="success-message"]');
  readonly errorMessage = () => this.page.locator('[data-testid="error-message"]');
  readonly propertyList = () => this.page.locator('[data-testid="property-list"]');
  readonly editButton = () => this.page.locator('[data-testid="edit-property"]');
  readonly deleteButton = () => this.page.locator('[data-testid="delete-property"]');
  readonly confirmDeleteButton = () => this.page.locator('[data-testid="confirm-delete"]');
  readonly imageUploadInput = () => this.page.locator('[data-testid="image-upload"]');

  /**
   * Navigate to agent dashboard
   */
  async navigateToDashboard() {
    await this.goto('/agent/dashboard');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to add property page
   */
  async navigateToAddProperty() {
    await this.goto('/agent/properties/add');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to property list
   */
  async navigateToPropertyList() {
    await this.goto('/agent/properties');
    await this.waitForPageLoad();
  }

  /**
   * Fill property form
   */
  async fillPropertyForm(propertyData: {
    title: string;
    description: string;
    price: string;
    location: string;
    bedrooms: string;
    bathrooms: string;
    area: string;
  }) {
    await this.titleInput().fill(propertyData.title);
    await this.descriptionInput().fill(propertyData.description);
    await this.priceInput().fill(propertyData.price);
    await this.locationInput().fill(propertyData.location);
    await this.bedroomsInput().fill(propertyData.bedrooms);
    await this.bathroomsInput().fill(propertyData.bathrooms);
    await this.areaInput().fill(propertyData.area);
  }

  /**
   * Submit property form
   */
  async submitPropertyForm() {
    await this.submitButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Upload property images
   */
  async uploadImages(imagePaths: string[]) {
    for (const imagePath of imagePaths) {
      await this.imageUploadInput().setInputFiles(imagePath);
    }
  }

  /**
   * Get property count
   */
  async getPropertyCount(): Promise<number> {
    const properties = this.page.locator('[data-testid="property-item"]');
    return await properties.count();
  }

  /**
   * Edit property
   */
  async editProperty(propertyIndex: number) {
    const editButtons = this.page.locator('[data-testid="edit-property"]');
    await editButtons.nth(propertyIndex).click();
    await this.waitForPageLoad();
  }

  /**
   * Delete property
   */
  async deleteProperty(propertyIndex: number) {
    const deleteButtons = this.page.locator('[data-testid="delete-property"]');
    await deleteButtons.nth(propertyIndex).click();
    
    // Confirm deletion
    await this.confirmDeleteButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Search properties
   */
  async searchProperties(searchTerm: string) {
    const searchInput = this.page.locator('[data-testid="search-properties"]');
    await searchInput.fill(searchTerm);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Filter properties
   */
  async filterProperties(filterType: string, value: string) {
    const filterSelect = this.page.locator(`[data-testid="filter-${filterType}"]`);
    await filterSelect.selectOption(value);
    await this.waitForPageLoad();
  }
}

test.describe('Agent Property Management', () => {
  let agentPage: AgentPropertyPage;

  test.beforeEach(async ({ page }) => {
    agentPage = new AgentPropertyPage(page);
    
    // Use authenticated state for agent
    await page.context().addCookies([
      {
        name: 'auth-token',
        value: 'agent-auth-token',
        domain: 'localhost',
        path: '/',
      }
    ]);
  });

  test.describe('Add Property', () => {
    test.beforeEach(async ({ page }) => {
      await agentPage.navigateToAddProperty();
    });

    test('should display add property form', async ({ page }) => {
      // Verify form elements are visible
      await expect(agentPage.propertyForm()).toBeVisible();
      await expect(agentPage.titleInput()).toBeVisible();
      await expect(agentPage.descriptionInput()).toBeVisible();
      await expect(agentPage.priceInput()).toBeVisible();
      await expect(agentPage.locationInput()).toBeVisible();
      await expect(agentPage.submitButton()).toBeVisible();
    });

    test('should add property with valid data', async ({ page }) => {
      const propertyData = {
        title: 'Test Property - Accra',
        description: 'A beautiful test property in Accra with modern amenities',
        price: '500000',
        location: 'Accra, Ghana',
        bedrooms: '3',
        bathrooms: '2',
        area: '150'
      };

      // Fill form
      await agentPage.fillPropertyForm(propertyData);
      
      // Submit form
      await agentPage.submitPropertyForm();
      
      // Verify success message
      await expect(agentPage.successMessage()).toBeVisible();
      
      // Verify redirect to property list
      await agentPage.expectURLContains('properties');
    });

    test('should show error with missing required fields', async ({ page }) => {
      // Submit empty form
      await agentPage.submitPropertyForm();
      
      // Verify error message is displayed
      await expect(agentPage.errorMessage()).toBeVisible();
    });

    test('should show error with invalid price', async ({ page }) => {
      const propertyData = {
        title: 'Test Property',
        description: 'Test description',
        price: 'invalid-price',
        location: 'Accra, Ghana',
        bedrooms: '3',
        bathrooms: '2',
        area: '150'
      };

      await agentPage.fillPropertyForm(propertyData);
      await agentPage.submitPropertyForm();
      
      // Verify error message is displayed
      await expect(agentPage.errorMessage()).toBeVisible();
    });

    test('should handle image upload', async ({ page }) => {
      // Create test image files
      const testImages = ['tests/fixtures/property1.jpg', 'tests/fixtures/property2.jpg'];
      
      // Upload images
      await agentPage.uploadImages(testImages);
      
      // Verify images are uploaded (check for preview or file names)
      const imagePreviews = page.locator('[data-testid="image-preview"]');
      expect(await imagePreviews.count()).toBeGreaterThan(0);
    });

    test('should validate location coordinates', async ({ page }) => {
      const propertyData = {
        title: 'Test Property',
        description: 'Test description',
        price: '500000',
        location: 'Accra, Ghana',
        bedrooms: '3',
        bathrooms: '2',
        area: '150'
      };

      await agentPage.fillPropertyForm(propertyData);
      
      // Verify location input accepts coordinates
      await agentPage.locationInput().fill('5.5600, -0.2057'); // Accra coordinates
      
      await agentPage.submitPropertyForm();
      
      // Should handle coordinates properly
      await expect(agentPage.successMessage()).toBeVisible();
    });
  });

  test.describe('Edit Property', () => {
    test.beforeEach(async ({ page }) => {
      await agentPage.navigateToPropertyList();
    });

    test('should edit existing property', async ({ page }) => {
      // Get initial property count
      const initialCount = await agentPage.getPropertyCount();
      expect(initialCount).toBeGreaterThan(0);
      
      // Edit first property
      await agentPage.editProperty(0);
      
      // Modify title
      await agentPage.titleInput().fill('Updated Property Title');
      
      // Submit changes
      await agentPage.submitPropertyForm();
      
      // Verify success message
      await expect(agentPage.successMessage()).toBeVisible();
    });

    test('should preserve existing data when editing', async ({ page }) => {
      // Edit first property
      await agentPage.editProperty(0);
      
      // Verify form is pre-filled with existing data
      const titleValue = await agentPage.titleInput().inputValue();
      expect(titleValue).toBeTruthy();
      
      const descriptionValue = await agentPage.descriptionInput().inputValue();
      expect(descriptionValue).toBeTruthy();
    });
  });

  test.describe('Delete Property', () => {
    test.beforeEach(async ({ page }) => {
      await agentPage.navigateToPropertyList();
    });

    test('should delete property with confirmation', async ({ page }) => {
      // Get initial property count
      const initialCount = await agentPage.getPropertyCount();
      expect(initialCount).toBeGreaterThan(0);
      
      // Delete first property
      await agentPage.deleteProperty(0);
      
      // Verify property count decreased
      const finalCount = await agentPage.getPropertyCount();
      expect(finalCount).toBe(initialCount - 1);
    });

    test('should show confirmation dialog before deletion', async ({ page }) => {
      // Click delete button
      const deleteButtons = agentPage.page.locator('[data-testid="delete-property"]');
      await deleteButtons.first().click();
      
      // Verify confirmation dialog is visible
      await expect(agentPage.confirmDeleteButton()).toBeVisible();
    });
  });

  test.describe('Property List Management', () => {
    test.beforeEach(async ({ page }) => {
      await agentPage.navigateToPropertyList();
    });

    test('should display property list', async ({ page }) => {
      // Verify property list is visible
      await expect(agentPage.propertyList()).toBeVisible();
      
      // Verify properties are displayed
      const propertyCount = await agentPage.getPropertyCount();
      expect(propertyCount).toBeGreaterThanOrEqual(0);
    });

    test('should search properties', async ({ page }) => {
      // Search for specific property
      await agentPage.searchProperties('Accra');
      
      // Verify search results
      const searchResults = page.locator('[data-testid="search-results"]');
      await expect(searchResults).toBeVisible();
    });

    test('should filter properties by status', async ({ page }) => {
      // Filter by active status
      await agentPage.filterProperties('status', 'active');
      
      // Verify filtered results
      const filteredResults = page.locator('[data-testid="filtered-results"]');
      await expect(filteredResults).toBeVisible();
    });

    test('should paginate property list', async ({ page }) => {
      // Check if pagination exists
      const pagination = page.locator('[data-testid="pagination"]');
      
      if (await pagination.isVisible()) {
        // Navigate to next page
        const nextButton = page.locator('[data-testid="next-page"]');
        await nextButton.click();
        
        // Verify page changed
        await agentPage.waitForPageLoad();
        
        // Verify URL contains page parameter
        await agentPage.expectURLContains('page=2');
      }
    });
  });

  test.describe('Property Validation', () => {
    test.beforeEach(async ({ page }) => {
      await agentPage.navigateToAddProperty();
    });

    test('should validate price range', async ({ page }) => {
      const testCases = [
        { price: '0', expected: 'error' },
        { price: '-1000', expected: 'error' },
        { price: '100000', expected: 'success' },
        { price: '999999999', expected: 'success' }
      ];

      for (const testCase of testCases) {
        await agentPage.priceInput().fill(testCase.price);
        await agentPage.submitPropertyForm();
        
        if (testCase.expected === 'error') {
          await expect(agentPage.errorMessage()).toBeVisible();
        } else {
          // Should not show error for valid prices
          const hasError = await agentPage.errorMessage().isVisible();
          expect(hasError).toBe(false);
        }
      }
    });

    test('should validate bedroom and bathroom counts', async ({ page }) => {
      const testCases = [
        { bedrooms: '0', bathrooms: '0', expected: 'error' },
        { bedrooms: '10', bathrooms: '15', expected: 'error' },
        { bedrooms: '3', bathrooms: '2', expected: 'success' }
      ];

      for (const testCase of testCases) {
        await agentPage.bedroomsInput().fill(testCase.bedrooms);
        await agentPage.bathroomsInput().fill(testCase.bathrooms);
        await agentPage.submitPropertyForm();
        
        if (testCase.expected === 'error') {
          await expect(agentPage.errorMessage()).toBeVisible();
        }
      }
    });

    test('should validate area measurements', async ({ page }) => {
      const testCases = [
        { area: '0', expected: 'error' },
        { area: '-50', expected: 'error' },
        { area: '1000', expected: 'success' }
      ];

      for (const testCase of testCases) {
        await agentPage.areaInput().fill(testCase.area);
        await agentPage.submitPropertyForm();
        
        if (testCase.expected === 'error') {
          await expect(agentPage.errorMessage()).toBeVisible();
        }
      }
    });
  });

  test.describe('Responsive Design', () => {
    test('should work on mobile devices', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await agentPage.navigateToAddProperty();
      
      // Verify form is still functional on mobile
      await expect(agentPage.propertyForm()).toBeVisible();
      await expect(agentPage.titleInput()).toBeVisible();
      await expect(agentPage.submitButton()).toBeVisible();
    });

    test('should work on tablet devices', async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await agentPage.navigateToPropertyList();
      
      // Verify property list is displayed properly
      await expect(agentPage.propertyList()).toBeVisible();
    });
  });
});
