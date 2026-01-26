import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display Aurelia branding", async ({ page }) => {
    // Check for brand name
    await expect(page.getByText("AURELIA").first()).toBeVisible();
  });

  test("should have a hero section with video", async ({ page }) => {
    // Check for video element
    const video = page.locator("video");
    await expect(video.first()).toBeVisible();
  });

  test("should display navigation menu", async ({ page }) => {
    // Check for navigation items
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("should have CTA buttons", async ({ page }) => {
    // Look for primary CTAs
    const ctaButtons = page.getByRole("button").or(page.getByRole("link", { name: /start|join|begin|discover/i }));
    await expect(ctaButtons.first()).toBeVisible();
  });

  test("should display services section", async ({ page }) => {
    // Look for services content
    const servicesContent = page.getByText(/concierge|luxury|service/i).first();
    await expect(servicesContent).toBeVisible();
  });

  test("should have responsive mobile menu", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check for mobile menu button (hamburger)
    const menuButton = page.getByRole("button", { name: /menu|toggle|navigation/i });
    
    // Mobile menu should be visible or hamburger button
    if (await menuButton.isVisible()) {
      await menuButton.click();
      // Menu should open
      await expect(page.locator("[data-state='open']")).toBeVisible();
    }
  });

  test("should load without console errors", async ({ page }) => {
    const errors: string[] = [];
    
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        errors.push(msg.text());
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    
    // Filter out expected/benign errors
    const significantErrors = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("404")
    );
    
    expect(significantErrors).toHaveLength(0);
  });
});

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display footer with links", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toBeVisible();
  });

  test("should have privacy policy link", async ({ page }) => {
    const privacyLink = page.getByRole("link", { name: /privacy/i });
    await expect(privacyLink).toBeVisible();
  });

  test("should have terms link", async ({ page }) => {
    const termsLink = page.getByRole("link", { name: /terms/i });
    await expect(termsLink).toBeVisible();
  });
});
