import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(path: string) {
    await this.page.goto(path);
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Get element by role
   */
  getByRole(role: string, options?: { name?: string }): Locator {
    return this.page.getByRole(role as any, options);
  }

  /**
   * Get element by text
   */
  getByText(text: string): Locator {
    return this.page.getByText(text);
  }

  /**
   * Get element by label
   */
  getByLabel(text: string): Locator {
    return this.page.getByLabel(text);
  }

  /**
   * Fill a form field
   */
  async fillField(selector: string, value: string) {
    await this.page.fill(selector, value);
  }

  /**
   * Click an element
   */
  async clickElement(selector: string) {
    await this.page.click(selector);
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string) {
    await this.page.waitForSelector(selector, { state: 'visible' });
  }

  /**
   * Assert element is visible
   */
  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  /**
   * Assert element has text
   */
  async expectElementHasText(selector: string, text: string) {
    await expect(this.page.locator(selector)).toHaveText(text);
  }

  /**
   * Assert URL contains path
   */
  async expectURLContains(path: string) {
    await expect(this.page).toHaveURL(new RegExp(path));
  }

  /**
   * Take screenshot
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  /**
   * Wait for navigation
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Reload page
   */
  async reload() {
    await this.page.reload();
  }

  /**
   * Go back
   */
  async goBack() {
    await this.page.goBack();
  }

  /**
   * Wait for timeout
   */
  async wait(ms: number) {
    await this.page.waitForTimeout(ms);
  }

  /**
   * Check if element exists
   */
  async elementExists(selector: string): Promise<boolean> {
    const element = this.page.locator(selector);
    return await element.count() > 0;
  }

  /**
   * Get element count
   */
  async getElementCount(selector: string): Promise<number> {
    const elements = this.page.locator(selector);
    return await elements.count();
  }

  /**
   * Assert element count
   */
  async expectElementCount(selector: string, count: number) {
    const elements = this.page.locator(selector);
    await expect(elements).toHaveCount(count);
  }

  /**
   * Handle dialog (alert, confirm, prompt)
   */
  async handleDialog(accept: boolean, promptText?: string) {
    this.page.on('dialog', dialog => {
      if (accept) {
        if (promptText) {
          dialog.accept(promptText);
        } else {
          dialog.accept();
        }
      } else {
        dialog.dismiss();
      }
    });
  }

  /**
   * Wait for network request to complete
   */
  async waitForNetworkIdle() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Wait for specific network request
   */
  async waitForRequest(urlPattern: string) {
    await this.page.waitForRequest(new RegExp(urlPattern));
  }

  /**
   * Wait for specific network response
   */
  async waitForResponse(urlPattern: string) {
    await this.page.waitForResponse(new RegExp(urlPattern));
  }
}
