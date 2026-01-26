import { test, expect } from "@playwright/test";

test.describe("Partner Application Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should navigate to partner page", async ({ page }) => {
    // Find and click partners link
    const partnerLink = page.getByRole("link", { name: /partner/i });
    
    if (await partnerLink.isVisible()) {
      await partnerLink.click();
      await expect(page).toHaveURL(/partner/);
    }
  });

  test("should display partner benefits", async ({ page }) => {
    await page.goto("/partners");
    
    // Check for partner content
    const benefitsContent = page.getByText(/partner|commission|network|exclusive/i).first();
    await expect(benefitsContent).toBeVisible();
  });

  test("should show partner application form", async ({ page }) => {
    await page.goto("/partners/apply");
    
    // Check for form elements
    const form = page.locator("form");
    await expect(form).toBeVisible();
    
    // Check for required fields
    const nameInput = page.getByLabel(/name|company/i);
    const emailInput = page.getByLabel(/email/i);
    
    await expect(nameInput.or(page.getByPlaceholder(/name/i))).toBeVisible();
    await expect(emailInput.or(page.getByPlaceholder(/email/i))).toBeVisible();
  });

  test("should validate partner application form", async ({ page }) => {
    await page.goto("/partners/apply");
    
    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /submit|apply|send/i });
    
    if (await submitButton.isVisible()) {
      await submitButton.click();
      
      // Should show validation errors
      const errorMessages = page.getByText(/required|invalid|please/i);
      await expect(errorMessages.first()).toBeVisible();
    }
  });
});

test.describe("Partner Portal Access", () => {
  test("should redirect to auth for unauthenticated users", async ({ page }) => {
    await page.goto("/partner-portal");
    
    // Should redirect to login
    await expect(page).toHaveURL(/auth|login/);
  });
});
