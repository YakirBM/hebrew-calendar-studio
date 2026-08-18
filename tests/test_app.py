from __future__ import annotations

import json
import os
from pathlib import Path
import sys

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ARTIFACTS = ROOT / "qa" / "test-artifacts"
CHROME = os.environ.get(
    "CHROME_PATH",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def wait_for_calendar(page) -> str:
    page.wait_for_function(
        """() => ['online', 'cache', 'error'].includes(
            document.querySelector('#connectionPill')?.dataset.state
        )""",
        timeout=25000,
    )
    return page.locator("#connectionPill").get_attribute("data-state") or ""


def main() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    results: dict[str, object] = {}
    page_errors: list[str] = []
    console_errors: list[str] = []
    failed_responses: list[dict[str, object]] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(
            headless=True,
            executable_path=CHROME,
        )
        context = browser.new_context(
            viewport={"width": 1536, "height": 1050},
            locale="he-IL",
            timezone_id="Asia/Jerusalem",
        )
        page = context.new_page()
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on(
            "response",
            lambda response: failed_responses.append({"status": response.status, "url": response.url})
            if response.status >= 400
            else None,
        )
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            and "fonts.gstatic" not in message.text
            and "ERR_INTERNET_DISCONNECTED" not in message.text
            and "Failed to load resource" not in message.text
            else None,
        )

        page.goto(HTML.as_uri(), wait_until="networkidle")
        initial_status = wait_for_calendar(page)
        results["initial_status"] = initial_status
        assert initial_status == "online", page.locator("#connectionText").inner_text()
        page.wait_for_function("() => !document.querySelector('#printButton').disabled")
        assert page.locator("#printButton").is_enabled()
        assert page.locator(".page-shell").count() == 1
        assert page.locator(".weekday-header").all_text_contents() == [
            "ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"
        ]
        assert page.locator(".day-cell[data-date]").count() == 154

        first_date = page.locator(".day-cell[data-date]").first.get_attribute("data-date")
        last_date = page.locator(".day-cell[data-date]").last.get_attribute("data-date")
        results["default_range"] = [first_date, last_date]
        assert first_date == "2026-08-16"
        assert last_date == "2027-01-16"

        first_cell = page.locator(".day-cell[data-date='2026-08-16']")
        assert "16/08" in first_cell.inner_text()
        first_cell.click()
        page.locator("#newNoteText").fill("יום הולדת לאבא")
        page.locator("#noteForm button[type='submit']").click()
        assert page.locator("#existingNotes input[data-field='text']").input_value() == "יום הולדת לאבא"
        page.locator("#closeDialog").click()
        assert "יום הולדת לאבא" in page.locator(".day-cell[data-date='2026-08-16']").inner_text()

        page.locator("#startDate").fill("2023-12-03")
        page.locator("#endDate").fill("2024-05-04")
        assert page.locator("#printButton").is_disabled()
        page.locator("#generateButton").click()
        page.wait_for_function("() => document.querySelector('#connectionPill').dataset.state === 'online'", timeout=25000)
        page.wait_for_function("() => !document.querySelector('#printButton').disabled")
        assert page.locator("#printButton").is_enabled()

        leap_cell = page.locator(".day-cell[data-date='2024-02-10']")
        results["leap_cell"] = leap_cell.inner_text()
        assert "אדר א" in leap_cell.inner_text()
        assert "ראש חודש" in page.locator(".day-cell[data-date='2024-03-10']").inner_text()
        assert "ראש חודש" in page.locator(".day-cell[data-date='2024-03-11']").inner_text()
        assert "אחרי מות" in page.locator(".day-cell[data-date='2024-05-04']").inner_text()

        page.locator("#customEvents").evaluate(
            """el => {
                el.value = '2024-02-10 | יום מיוחד';
                el.dispatchEvent(new Event('input', { bubbles: true }));
            }"""
        )
        assert "יום מיוחד" in page.locator(".day-cell[data-date='2024-02-10']").inner_text()

        overflow_count = page.locator(".day-cell.overflowing").count()
        results["overflow_count"] = overflow_count
        results["overflow_dates"] = page.locator(".day-cell.overflowing").evaluate_all(
            "cells => cells.map(cell => cell.dataset.date)"
        )
        page.screenshot(path=ARTIFACTS / "desktop.png", full_page=True)

        page.emulate_media(media="print")
        print_rect = page.locator(".print-page").first.evaluate(
            "el => ({width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height})"
        )
        results["print_rect"] = print_rect
        assert 790 <= print_rect["width"] <= 798
        assert 1118 <= print_rect["height"] <= 1127
        page.screenshot(path=ARTIFACTS / "print-media.png", full_page=True)
        page.emulate_media(media="screen")

        page.locator("#endDate").fill("2024-05-18")
        page.locator("#generateButton").click()
        page.wait_for_function("() => document.querySelector('#connectionPill').dataset.state === 'online'", timeout=25000)
        page.wait_for_function("() => !document.querySelector('#printButton').disabled")
        assert page.locator(".page-shell").count() == 1
        assert "יום השואה" in page.locator(".day-cell[data-date='2024-05-06']").inner_text()
        assert "יום הזיכרון" in page.locator(".day-cell[data-date='2024-05-13']").inner_text()
        assert "יום העצמאות" in page.locator(".day-cell[data-date='2024-05-14']").inner_text()
        results["state_days_verified"] = True

        page.add_init_script("Object.defineProperty(navigator, 'onLine', { get: () => false })")
        context.set_offline(True)
        page.reload(wait_until="domcontentloaded")
        offline_status = wait_for_calendar(page)
        results["offline_status"] = offline_status
        assert offline_status == "cache"
        page.wait_for_function("() => !document.querySelector('#printButton').disabled")
        assert page.locator("#printButton").is_enabled()
        assert "ללא חיבור" in page.locator("#connectionText").inner_text()
        context.close()

        fresh_offline_context = browser.new_context(
            viewport={"width": 1280, "height": 800},
            locale="he-IL",
            timezone_id="Asia/Jerusalem",
            offline=True,
        )
        fresh_offline = fresh_offline_context.new_page()
        fresh_offline.add_init_script("Object.defineProperty(navigator, 'onLine', { get: () => false })")
        fresh_offline.goto(HTML.as_uri(), wait_until="domcontentloaded")
        assert wait_for_calendar(fresh_offline) == "error"
        assert fresh_offline.locator("#printButton").is_disabled()
        results["fresh_offline_status"] = "error"
        fresh_offline_context.close()

        mobile_context = browser.new_context(
            viewport={"width": 390, "height": 844},
            locale="he-IL",
            timezone_id="Asia/Jerusalem",
        )
        mobile = mobile_context.new_page()
        mobile.on("pageerror", lambda error: page_errors.append(str(error)))
        mobile.goto(HTML.as_uri(), wait_until="networkidle")
        assert wait_for_calendar(mobile) == "online"
        assert mobile.locator("#mobileSettingsButton").is_visible()
        mobile.locator("#mobileSettingsButton").click()
        assert "open" in (mobile.locator("#controlsPanel").get_attribute("class") or "")
        mobile.wait_for_timeout(350)
        mobile.screenshot(path=ARTIFACTS / "mobile.png", full_page=True)
        mobile.locator("#closeMobileSettings").click()
        mobile.wait_for_timeout(300)
        assert "open" not in (mobile.locator("#controlsPanel").get_attribute("class") or "")
        mobile_context.close()
        browser.close()

    results["page_errors"] = page_errors
    results["console_errors"] = console_errors
    results["failed_responses"] = failed_responses
    (ARTIFACTS / "results.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8"
    )
    assert not page_errors, page_errors
    assert not console_errors, console_errors
    assert not [item for item in failed_responses if "hebcal.com/hebcal" in str(item["url"])], failed_responses
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
