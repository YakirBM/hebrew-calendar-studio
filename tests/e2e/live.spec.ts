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
