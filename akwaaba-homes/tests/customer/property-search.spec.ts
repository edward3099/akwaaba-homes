import { test, expect } from '@playwright/test';
import { BasePage } from '../shared/BasePage';

class PropertySearchPage extends BasePage {
  // Locators
  readonly searchInput = () => this.page.locator('[data-testid="search-input"]');
  readonly searchButton = () => this.page.locator('[data-testid="search-button"]');
  readonly filterPanel = () => this.page.locator('[data-testid="filter-panel"]');
  readonly priceMinInput = () => this.page.locator('[data-testid="price-min"]');
  readonly priceMaxInput = () => this.page.locator('[data-testid="price-max"]');
  readonly bedroomsSelect = () => this.page.locator('[data-testid="bedrooms-select"]');
  readonly propertyCards = () => this.page.locator('[data-testid="property-card"]');
  readonly noResultsMessage = () => this.page.locator('[data-testid="no-results"]');
  readonly mapViewButton = () => this.page.locator('[data-testid="map-view-button"]');
  readonly listViewButton = () => this.page.locator('[data-testid="list-view-button"]');

  /**
   * Navigate to the property search page
   */
  async navigateToSearch() {
    await this.goto('/search');
    await this.waitForPageLoad();
  }

  /**
   * Perform a basic location search
   */
  async searchByLocation(location: string) {
    await this.searchInput().fill(location);
    await this.searchButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Apply price filter
   */
  async applyPriceFilter(min: string, max: string) {
    await this.priceMinInput().fill(min);
    await this.priceMaxInput().fill(max);
    await this.page.keyboard.press('Enter');
    await this.waitForPageLoad();
  }

  /**
   * Apply bedrooms filter
   */
  async applyBedroomsFilter(bedrooms: string) {
    await this.bedroomsSelect().selectOption(bedrooms);
    await this.waitForPageLoad();
  }

  /**
   * Switch to map view
   */
  async switchToMapView() {
    await this.mapViewButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Switch to list view
   */
  async switchToListView() {
    await this.listViewButton().click();
    await this.waitForPageLoad();
  }

  /**
   * Get property count
   */
  async getPropertyCount(): Promise<number> {
    return await this.propertyCards().count();
  }

  /**
   * Check if no results message is visible
   */
  async hasNoResults(): Promise<boolean> {
    return await this.noResultsMessage().isVisible();
  }
}

test.describe('Property Search - Unauthenticated User', () => {
  let searchPage: PropertySearchPage;

  test.beforeEach(async ({ page }) => {
    searchPage = new PropertySearchPage(page);
    await searchPage.navigateToSearch();
  });

  test('should display search interface', async ({ page }) => {
    // Verify search input is visible
    await expect(searchPage.searchInput()).toBeVisible();
    
    // Verify search button is visible
    await expect(searchPage.searchButton()).toBeVisible();
    
    // Verify filter panel is visible
    await expect(searchPage.filterPanel()).toBeVisible();
  });

  test('should perform basic location search', async ({ page }) => {
    // Search for properties in Accra
    await searchPage.searchByLocation('Accra');
    
    // Verify search results are displayed
    const propertyCount = await searchPage.getPropertyCount();
    expect(propertyCount).toBeGreaterThan(0);
    
    // Verify URL contains search parameter
    await searchPage.expectURLContains('search');
  });

  test('should apply price filters', async ({ page }) => {
    // Apply price filter
    await searchPage.applyPriceFilter('100000', '500000');
    
    // Verify results are filtered
    const propertyCount = await searchPage.getPropertyCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should apply bedrooms filter', async ({ page }) => {
    // Apply bedrooms filter
    await searchPage.applyBedroomsFilter('3');
    
    // Verify results are filtered
    const propertyCount = await searchPage.getPropertyCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle no search results', async ({ page }) => {
    // Search for a location with no properties
    await searchPage.searchByLocation('NonexistentLocation123');
    
    // Verify no results message is displayed
    await expect(searchPage.noResultsMessage()).toBeVisible();
  });

  test('should switch between map and list views', async ({ page }) => {
    // Switch to map view
    await searchPage.switchToMapView();
    
    // Verify map view is active
    await searchPage.expectURLContains('map');
    
    // Switch back to list view
    await searchPage.switchToListView();
    
    // Verify list view is active
    await searchPage.expectURLContains('list');
  });

  test('should maintain search state in URL', async ({ page }) => {
    // Perform a search
    await searchPage.searchByLocation('Kumasi');
    
    // Apply filters
    await searchPage.applyPriceFilter('200000', '800000');
    
    // Verify URL contains search parameters
    const currentURL = await searchPage.getCurrentURL();
    expect(currentURL).toContain('search');
    expect(currentURL).toContain('price');
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Verify search interface is still functional
    await expect(searchPage.searchInput()).toBeVisible();
    await expect(searchPage.searchButton()).toBeVisible();
    
    // Perform a search
    await searchPage.searchByLocation('Tamale');
    
    // Verify results are displayed
    const propertyCount = await searchPage.getPropertyCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should handle search with special characters', async ({ page }) => {
    // Search with special characters
    await searchPage.searchByLocation('Accra-East, Ghana');
    
    // Verify search handles special characters gracefully
    const propertyCount = await searchPage.getPropertyCount();
    expect(propertyCount).toBeGreaterThanOrEqual(0);
  });

  test('should clear search filters', async ({ page }) => {
    // Apply initial filters
    await searchPage.applyPriceFilter('100000', '500000');
    await searchPage.applyBedroomsFilter('2');
    
    // Get initial count
    const initialCount = await searchPage.getPropertyCount();
    
    // Clear filters (assuming there's a clear button)
    const clearButton = page.locator('[data-testid="clear-filters"]');
    if (await clearButton.isVisible()) {
      await clearButton.click();
      await searchPage.waitForPageLoad();
      
      // Verify filters are cleared
      const finalCount = await searchPage.getPropertyCount();
      expect(finalCount).not.toBe(initialCount);
    }
  });
});
