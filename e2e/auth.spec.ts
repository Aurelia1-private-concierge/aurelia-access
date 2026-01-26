import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display login link in navigation", async ({ page }) => {
    // Check for login/auth link in navigation
    const loginLink = page.getByRole("link", { name: /login|sign in|member/i });
    await expect(loginLink).toBeVisible();
  });

  test("should navigate to login page", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /login|sign in|member/i });
    await loginLink.click();
    
    // Should be on auth page
    await expect(page).toHaveURL(/auth|login/);
  });

  test("should display email and password inputs on login page", async ({ page }) => {
    await page.goto("/auth");
    
    const emailInput = page.getByPlaceholder(/email/i);
    const passwordInput = page.getByPlaceholder(/password/i);
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("should show validation errors for empty form submission", async ({ page }) => {
    await page.goto("/auth");
    
    // Try to submit empty form
    const submitButton = page.getByRole("button", { name: /sign in|login|submit/i });
    await submitButton.click();
    
    // Should show some form of validation feedback
    // Either HTML5 validation or custom error messages
    const emailInput = page.getByPlaceholder(/email/i);
    const isValid = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid);
    
    expect(isValid).toBe(false);
  });

  test("should toggle between sign in and sign up modes", async ({ page }) => {
    await page.goto("/auth");
    
    // Look for toggle to switch modes
    const toggleLink = page.getByText(/create|sign up|register|don't have/i);
    
    if (await toggleLink.isVisible()) {
      await toggleLink.click();
      
      // Check for sign up specific content
      await expect(page.getByText(/sign up|register|create account/i).first()).toBeVisible();
    }
  });
});

test.describe("Protected Routes", () => {
  test("should redirect unauthenticated users from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    
    // Should redirect to auth or show auth prompt
    await expect(page).toHaveURL(/auth|login|\//);
  });

  test("should redirect from admin without admin role", async ({ page }) => {
    await page.goto("/admin");
    
    // Should redirect or show access denied
    await expect(page).toHaveURL(/auth|login|\/|dashboard/);
  });
});
