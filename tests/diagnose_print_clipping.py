from __future__ import annotations

import json
import os
from pathlib import Path
import sys

from playwright.sync_api import sync_playwright


ROOT = Path(__file__).resolve().parents[1]
HTML = ROOT / "index.html"
ARTIFACTS = ROOT / "qa" / "clipping-diagnostics"
CHROME = os.environ.get(
    "CHROME_PATH",
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
)

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")


def configure(page) -> None:
    page.locator("#startDate").fill("2026-08-16")
    page.locator("#endDate").fill("2027-01-16")
    page.locator("#paperSize").select_option("a4")
    page.locator("#paginationMode").select_option("single")
    page.locator("#holidayColor").evaluate(
        """el => {
            el.value = '#087a18';
            el.dispatchEvent(new Event('input', { bubbles: true }));
        }"""
    )
    page.locator("#generateButton").click()
    page.wait_for_function(
        """() => {
            const cells = [...document.querySelectorAll('.day-cell[data-date]')];
            return cells.length === 154
                && cells[0].dataset.date === '2026-08-16'
                && cells[cells.length - 1].dataset.date === '2027-01-16'
                && !document.querySelector('#printButton').disabled;
        }""",
        timeout=30000,
    )


def collect_metrics(page) -> dict[str, object]:
    return page.evaluate(
        """() => {
            const canvas = document.querySelector('.preview-canvas');
            const shell = document.querySelector('.page-shell');
            const printPage = document.querySelector('.print-page');
            const grid = document.querySelector('.calendar-grid');
            const cells = [...document.querySelectorAll('.day-cell')];
            const rect = el => {
                const r = el.getBoundingClientRect();
                return {left:r.left, right:r.right, top:r.top, bottom:r.bottom, width:r.width, height:r.height};
            };
            return {
                viewport: {width: innerWidth, height: innerHeight},
                canvas: {...rect(canvas), clientWidth:canvas.clientWidth, scrollWidth:canvas.scrollWidth, scrollLeft:canvas.scrollLeft},
                shell: rect(shell),
                printPage: rect(printPage),
                grid: rect(grid),
                overflowCells: cells.filter(cell => cell.scrollHeight > cell.clientHeight + 1 || cell.scrollWidth > cell.clientWidth + 1).length,
                childOverflowCells: cells.filter(cell => [...cell.children].some(child => child.scrollHeight > child.clientHeight + 1 || child.scrollWidth > child.clientWidth + 1)).length,
                markedOverflowCells: document.querySelectorAll('.day-cell.overflowing').length,
                verticalGridLines: document.querySelectorAll('.calendar-grid-lines line[data-axis="vertical"]').length,
                horizontalGridLines: document.querySelectorAll('.calendar-grid-lines line[data-axis="horizontal"]').length,
                gridColumns: getComputedStyle(grid).gridTemplateColumns,
                gridRows: getComputedStyle(grid).gridTemplateRows
            };
        }"""
    )


def main() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    results: dict[str, object] = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, executable_path=CHROME)
        page = browser.new_page(
            viewport={"width": 1536, "height": 1050},
            locale="he-IL",
            timezone_id="Asia/Jerusalem",
        )
        page.goto(HTML.as_uri(), wait_until="networkidle")
        page.wait_for_function("() => !document.querySelector('#printButton').disabled", timeout=30000)
        configure(page)

        results["desktop"] = collect_metrics(page)
        page.screenshot(path=ARTIFACTS / "svg-desktop.png", full_page=True)

        page.set_viewport_size({"width": 390, "height": 844})
        page.wait_for_timeout(250)
        results["mobile"] = collect_metrics(page)
        page.screenshot(path=ARTIFACTS / "svg-mobile.png", full_page=True)

        page.emulate_media(media="print")
        results["print"] = collect_metrics(page)
        page.pdf(
            path=ARTIFACTS / "svg-no-background.pdf",
            print_background=False,
            prefer_css_page_size=True,
        )
        browser.close()

    print(json.dumps(results, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
