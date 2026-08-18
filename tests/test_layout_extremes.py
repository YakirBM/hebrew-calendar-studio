from __future__ import annotations

import json
import os
from pathlib import Path
import sys

from playwright.sync_api import Page, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ARTIFACTS = ROOT / "qa" / "layout-artifacts"
PDF_ARTIFACTS = ARTIFACTS / "pdf"
CHROME = os.environ.get(
    "CHROME_PATH",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def wait_for_layout(page: Page, expected_first: str, expected_last: str) -> None:
    page.wait_for_function(
        """([first, last]) => {
            const cells = [...document.querySelectorAll('.day-cell[data-date]')];
            const meta = document.querySelector('#previewMeta')?.textContent || '';
            return cells.length > 0
                && cells[0].dataset.date === first
                && cells[cells.length - 1].dataset.date === last
                && !meta.includes('בודק התאמה')
                && (!document.querySelector('#printButton').disabled
                    || document.querySelectorAll('.day-cell.overflowing').length > 0);
        }""",
        arg=[expected_first, expected_last],
        timeout=30000,
    )


def generate(
    page: Page,
    *,
    start: str,
    end: str,
    paper: str = "a4",
    pagination: str = "single",
    weeks_per_page: int = 22,
    body_size: float | None = None,
) -> None:
    page.locator("#startDate").fill(start)
    page.locator("#endDate").fill(end)
    page.locator("#paperSize").select_option(paper)
    page.locator("#paginationMode").select_option(pagination)
    if pagination == "pages":
        assert page.locator("#weeksPerPage").is_enabled()
        page.locator("#weeksPerPage").fill(str(weeks_per_page))
    else:
        assert page.locator("#weeksPerPage").is_disabled()
    if body_size is not None:
        page.locator("#bodySize").evaluate(
            """(el, value) => {
                el.value = String(value);
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }""",
            body_size,
        )
    page.locator("#generateButton").click()
    wait_for_layout(page, start, end)


def dimensions(page: Page) -> list[dict[str, float | int]]:
    return page.locator(".print-page").evaluate_all(
        """pages => pages.map((page, pageIndex) => {
            const cells = [...page.querySelectorAll('.day-cell')];
            const widths = cells.map(cell => cell.getBoundingClientRect().width);
            const heights = cells.map(cell => cell.getBoundingClientRect().height);
            const dateCells = cells.filter(cell => cell.dataset.date);
            return {
                page: pageIndex + 1,
                cellCount: cells.length,
                dateCellCount: dateCells.length,
                verticalLines: page.querySelectorAll('.calendar-grid-lines line[data-axis="vertical"]').length,
                horizontalLines: page.querySelectorAll('.calendar-grid-lines line[data-axis="horizontal"]').length,
                minWidth: Math.min(...widths),
                maxWidth: Math.max(...widths),
                minHeight: Math.min(...heights),
                maxHeight: Math.max(...heights)
            };
        })"""
    )


def assert_equal_cells(metrics: list[dict[str, float | int]]) -> None:
    for page_metrics in metrics:
        width_delta = float(page_metrics["maxWidth"]) - float(page_metrics["minWidth"])
        height_delta = float(page_metrics["maxHeight"]) - float(page_metrics["minHeight"])
        assert width_delta <= 0.05, page_metrics
        assert height_delta <= 0.05, page_metrics
        assert int(page_metrics["verticalLines"]) == 8, page_metrics
        assert int(page_metrics["horizontalLines"]) == int(page_metrics["cellCount"]) // 7 + 2, page_metrics


def snapshot_result(page: Page) -> dict[str, object]:
    metrics = dimensions(page)
    assert_equal_cells(metrics)
    return {
        "pages": page.locator(".print-page").count(),
        "cells": page.locator(".day-cell[data-date]").count(),
        "overflow": page.locator(".day-cell.overflowing").count(),
        "printEnabled": page.locator("#printButton").is_enabled(),
        "meta": page.locator("#previewMeta").inner_text(),
        "notice": page.locator("#noticeBar").inner_text(),
        "dimensions": metrics,
    }


def main() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    PDF_ARTIFACTS.mkdir(parents=True, exist_ok=True)
    results: dict[str, object] = {}
    page_errors: list[str] = []
    console_errors: list[str] = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=CHROME)
        context = browser.new_context(
            viewport={"width": 1536, "height": 1050},
            locale="he-IL",
            timezone_id="Asia/Jerusalem",
        )
        page = context.new_page()
        page.on("pageerror", lambda error: page_errors.append(str(error)))
        page.on(
            "console",
            lambda message: console_errors.append(message.text)
            if message.type == "error"
            and "fonts.gstatic" not in message.text
            and "Failed to load resource" not in message.text
            else None,
        )

        page.goto(HTML.as_uri(), wait_until="networkidle")
        page.wait_for_function("() => !document.querySelector('#printButton').disabled", timeout=30000)

        # Baseline that mirrors the user's 22-row print preview.
        generate(page, start="2026-08-16", end="2027-01-16", paper="a4")
        results["a4_22_weeks"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 1
        assert page.locator(".day-cell[data-date]").count() == 154
        assert page.locator("#printButton").is_enabled()

        # Maximum practical weekly grid on one A4 page.
        generate(page, start="2026-01-04", end="2027-01-02", paper="a4", body_size=11)
        results["a4_52_weeks"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 1
        assert page.locator(".day-cell[data-date]").count() == 364
        assert page.locator("#printButton").is_enabled()
        page.screenshot(path=ARTIFACTS / "a4-52-weeks.png", full_page=True)
        page.emulate_media(media="print")
        page.pdf(
            path=PDF_ARTIFACTS / "a4-52-weeks.pdf",
            print_background=True,
            prefer_css_page_size=True,
        )
        a4_rect = page.locator(".print-page").first.evaluate(
            "el => ({width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height})"
        )
        assert abs(a4_rect["width"] - 793.70) < 0.2, a4_rect
        assert abs(a4_rect["height"] - 1122.52) < 0.2, a4_rect
        page.emulate_media(media="screen")
        results["a4_52_weeks"]["printRect"] = a4_rect

        # Same stress case on A3, including its physical print dimensions.
        generate(page, start="2026-01-04", end="2027-01-02", paper="a3", body_size=11)
        results["a3_52_weeks"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 1
        assert page.locator("#printButton").is_enabled()
        page.screenshot(path=ARTIFACTS / "a3-52-weeks.png", full_page=True)
        page.emulate_media(media="print")
        page.pdf(
            path=PDF_ARTIFACTS / "a3-52-weeks.pdf",
            print_background=True,
            prefer_css_page_size=True,
        )
        a3_rect = page.locator(".print-page").first.evaluate(
            "el => ({width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height})"
        )
        assert abs(a3_rect["width"] - 1122.52) < 0.2, a3_rect
        assert abs(a3_rect["height"] - 1587.40) < 0.2, a3_rect
        page.emulate_media(media="screen")
        results["a3_52_weeks"]["printRect"] = a3_rect

        # Near the supported range limit, the grid still remains one page and equal,
        # but export must stop when three lines per cell become physically impossible.
        generate(page, start="2025-01-05", end="2028-01-01", paper="a4", body_size=11)
        results["a4_156_weeks_guardrail"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 1
        assert page.locator(".day-cell[data-date]").count() == 1092
        assert page.locator(".day-cell.overflowing").count() > 0
        assert page.locator("#printButton").is_disabled()

        # Explicitly selected multi-page mode is the only case that may paginate.
        generate(
            page,
            start="2026-01-04",
            end="2027-01-02",
            paper="a4",
            pagination="pages",
            weeks_per_page=22,
            body_size=9,
        )
        results["explicit_multipage"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 3
        assert page.locator("#printButton").is_enabled()
        page.screenshot(path=ARTIFACTS / "explicit-multipage.png", full_page=True)
        page.emulate_media(media="print")
        page.pdf(
            path=PDF_ARTIFACTS / "explicit-multipage.pdf",
            print_background=True,
            prefer_css_page_size=True,
        )
        page.emulate_media(media="screen")

        # An intentionally impossible text payload must be reported, never clipped silently.
        dense_notes = {
            "2026-08-16": [
                {
                    "id": f"dense-{index}",
                    "text": "אזכור ארוך במיוחד לבדיקת גלישת טקסט ושמירה על כל התוכן " * 2,
                    "color": "#176b5b",
                    "bold": True,
                }
                for index in range(10)
            ]
        }
        page.evaluate(
            "notes => localStorage.setItem('seder-yom-notes-v1', JSON.stringify(notes))",
            dense_notes,
        )
        page.reload(wait_until="networkidle")
        page.wait_for_function("() => document.querySelectorAll('.day-cell[data-date]').length > 0")
        generate(page, start="2026-08-16", end="2027-01-16", paper="a4", body_size=11)
        results["unfit_text_blocked"] = snapshot_result(page)
        assert page.locator(".print-page").count() == 1
        assert page.locator(".day-cell.overflowing[data-date='2026-08-16']").count() == 1
        assert page.locator("#printButton").is_disabled()
        assert "נחסם" in page.locator("#noticeBar").inner_text()
        page.screenshot(path=ARTIFACTS / "unfit-text-blocked.png", full_page=True)

        browser.close()

    results["pageErrors"] = page_errors
    results["consoleErrors"] = console_errors
    assert not page_errors, page_errors
    assert not console_errors, console_errors
    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
