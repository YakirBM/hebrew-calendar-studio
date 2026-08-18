import { expect, test } from "@playwright/test";

test("production serves verified real calendar data without clipping", async ({ page }, testInfo) => {
  test.skip(!process.env.LIVE_SMOKE, "runs only against the public production deployment");
  await page.goto("/");
  await expect(page.getByText("מחובר לרשת · נתונים אומתו")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".weekday-header")).toHaveCount(7);
  await expect(page.locator(".day-cell[data-date]")).toHaveCount(154);
  await expect(page.locator(".day-cell.has-overflow")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "ייצוא PDF" })).toBeEnabled();
  const horizontalOverflow = await page.evaluate(() =>
    document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("production.png"), fullPage: true });
});

test("production exposes the touch-first week view on mobile", async ({ page }, testInfo) => {
  test.skip(!process.env.LIVE_SMOKE || testInfo.project.name !== "mobile-chromium", "mobile production smoke test");
  await page.goto("/");
  await expect(page.locator(".mobile-week-calendar")).toBeVisible({ timeout: 20_000 });
  await expect(page.locator(".mobile-day-card")).toHaveCount(7);
  await expect(page.locator(".mobile-action-bar")).toBeVisible();
  const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(horizontalOverflow).toBeLessThanOrEqual(1);
});
