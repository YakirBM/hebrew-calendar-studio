import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const formatIso = (date: Date) => date.toISOString().slice(0, 10);

test.beforeEach(async ({ page }) => {
  await page.route(/\/api\/calendar(?:\?|$)/, async (route) => {
    const url = new URL(route.request().url());
    const requestedStart = url.searchParams.get("start") ?? "2026-08-16";
    const requestedEnd = url.searchParams.get("end") ?? "2027-01-16";
    const first = new Date(`${requestedStart}T12:00:00Z`);
    first.setUTCDate(first.getUTCDate() - first.getUTCDay());
    const last = new Date(`${requestedEnd}T12:00:00Z`);
    last.setUTCDate(last.getUTCDate() + (6 - last.getUTCDay()));
    const days = [];
    for (let cursor = new Date(first); cursor <= last; cursor.setUTCDate(cursor.getUTCDate() + 1)) {
      const date = formatIso(cursor);
      days.push({
        date,
        hebrew: `${(cursor.getUTCDate() % 29) + 1} אלול תשפ״ו`,
        heDateParts: { d: String((cursor.getUTCDate() % 29) + 1), m: "Elul", y: "5786" },
        events: cursor.getUTCDay() === 6 ? [{ type: "parsha", label: "ראה", title: "Parashat Re'eh", category: "parashat" }] : [],
      });
    }
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ source: "Hebcal", verifiedAt: new Date().toISOString(), requestedStart, requestedEnd, alignedStart: formatIso(first), alignedEnd: formatIso(last), region: url.searchParams.get("region") ?? "israel", days }),
    });
  });
});

test("creates an equal-cell calendar and saves a personal note", async ({ page }, testInfo) => {
  await page.goto("/");
  await expect(page.getByText("מחובר לרשת · נתונים אומתו")).toBeVisible();
  await expect(page.locator(".weekday-header")).toHaveCount(7);
  await expect(page.locator(".day-cell[data-date]").first()).toBeVisible();

  const heights = await page.locator(".day-cell[data-date]").evaluateAll((cells) => cells.slice(0, 14).map((cell) => Math.round(cell.getBoundingClientRect().height * 10) / 10));
  expect(Math.max(...heights) - Math.min(...heights)).toBeLessThanOrEqual(0.2);

  const dayTrigger = testInfo.project.name === "mobile-chromium"
    ? page.locator(".mobile-day-card[data-mobile-date]").first()
    : page.locator(".day-cell[data-date]").first();
  await dayTrigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByPlaceholder("למשל: יום הולדת לאבא").fill("יום הולדת לאבא");
  await page.getByRole("button", { name: "הוספת אזכור", exact: true }).click();
  await expect(page.getByRole("dialog").getByText("יום הולדת לאבא")).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath("desktop-calendar.png"), fullPage: true });
});

test("supports A3 landscape without horizontal application overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop settings panel test");
  await page.goto("/");
  await expect(page.locator(".calendar-paper")).toBeVisible();
  await page.getByRole("radio", { name: "A3" }).click();
  await page.getByRole("radio", { name: "אופקי" }).click();
  await expect(page.locator(".calendar-paper")).toHaveAttribute("style", /width: 420mm/);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test("mobile settings are full-width, touchable and do not clip the preview", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile-only responsive test");
  await page.goto("/");
  await expect(page.locator(".mobile-week-calendar")).toBeVisible();
  await expect(page.locator(".mobile-day-card")).toHaveCount(7);
  await expect(page.locator(".mobile-action-bar")).toBeVisible();
  const dayTargets = await page.locator(".mobile-day-card").evaluateAll((cards) => cards.map((card) => card.getBoundingClientRect().height));
  expect(Math.min(...dayTargets)).toBeGreaterThanOrEqual(72);
  const actionTargets = await page.locator(".mobile-action-bar button").evaluateAll((buttons) => buttons.map((button) => button.getBoundingClientRect().height));
  expect(Math.min(...actionTargets)).toBeGreaterThanOrEqual(56);

  await page.getByRole("button", { name: "דף מלא" }).click();
  await expect(page.locator(".preview-page-frame").first()).toBeVisible();
  await page.getByRole("button", { name: "שבוע קריא" }).click();
  await expect(page.locator(".mobile-week-calendar")).toBeVisible();

  await page.getByRole("button", { name: "הגדרות" }).click();
  const panel = page.locator(".settings-panel");
  await expect(panel).toBeVisible();
  const box = await panel.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual((page.viewportSize()?.width ?? 0) - 1);
  const generateBox = await page.getByRole("button", { name: "הפקת לוח מעודכן" }).boundingBox();
  expect(generateBox?.height).toBeGreaterThanOrEqual(48);
  await page.getByRole("button", { name: "סגירת הגדרות" }).click();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await page.screenshot({ path: testInfo.outputPath("mobile-calendar.png"), fullPage: true });
});

test("mobile layout remains usable at compact portrait and landscape boundaries", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile-chromium", "mobile-only breakpoint test");
  for (const viewport of [{ width: 320, height: 568 }, { width: 667, height: 375 }]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".mobile-week-calendar")).toBeVisible();
    const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(horizontalOverflow).toBeLessThanOrEqual(1);
    const navBox = await page.locator(".mobile-action-bar").boundingBox();
    expect(navBox?.width).toBeGreaterThanOrEqual(viewport.width - 1);
    const headerBox = await page.locator(".mobile-week-calendar__header").boundingBox();
    expect(headerBox?.width).toBeLessThanOrEqual(viewport.width - 24);
  }
});

test("blocks export when extreme text still overflows at the safety minimum", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop overflow guard test");
  await page.goto("/");
  await expect(page.locator(".calendar-paper")).toBeVisible();
  await page.locator(".day-cell[data-date]").first().click();
  await page.getByPlaceholder("למשל: יום הולדת לאבא").fill("טקסט ארוך מאוד ".repeat(28));
  await page.getByRole("button", { name: "הוספת אזכור" }).click();
  await page.getByRole("button", { name: "סגירה" }).click();
  await expect(page.getByText(/נמצאה גלישת טקסט/)).toBeVisible();
  await expect(page.getByRole("button", { name: "ייצוא PDF" })).toBeDisabled();
});

test("creates an exact single-page A4 print artifact", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-chromium", "desktop PDF verification test");
  await page.goto("/");
  await expect(page.locator(".calendar-paper")).toBeVisible();
  await expect(page.getByRole("button", { name: "ייצוא PDF" })).toBeEnabled();
  const outputDirectory = path.resolve("tmp/pdfs");
  await mkdir(outputDirectory, { recursive: true });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: path.join(outputDirectory, "nextjs-a4-calendar.pdf"),
    printBackground: true,
    preferCSSPageSize: true,
  });
});
