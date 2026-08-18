# Hebrew Calendar Studio / סטודיו לוח עברי

**Public site / אתר ציבורי:**
[https://yakirbm.github.io/hebrew-calendar-studio/](https://yakirbm.github.io/hebrew-calendar-studio/)

A standalone, RTL-first Hebrew calendar planner that generates print-ready A4 or A3 calendar grids with Gregorian and Hebrew dates, Jewish holidays, fasts, Rosh Chodesh, weekly Torah portions, Israeli national observances, custom events, and personal notes.

יישום עצמאי בעברית וב-RTL ליצירת לוח תאריכים מוכן להדפסה בגודל A4 או A3. כל תא כולל תאריך לועזי ועברי ויכול לכלול חגים, צומות, ראשי חודשים, פרשות שבוע, מועדים ישראליים, אירועים חיצוניים ואזכורים אישיים.

## Quick start / הפעלה מהירה

1. Open the public site above, or open `index.html` locally in a current Chrome, Edge, or another Chromium-based browser.
2. Confirm that the connection indicator reports a verified Hebcal connection or a valid local cache.
3. Choose a range and print configuration, then select **Create verified preview**.
4. Click a day cell to add or edit personal notes.
5. Select **Export PDF** and save through the browser print dialog.

1. פתחו את האתר הציבורי בקישור לעיל, או את `index.html` מקומית בדפדפן Chrome או Edge עדכני.
2. ודאו שמחוון החיבור מציג אימות מול Hebcal או מטמון מקומי תקף.
3. בחרו טווח והגדרות הדפסה ולחצו על **יצירת תצוגה מדויקת**.
4. לחצו על תא יום כדי להוסיף או לערוך אזכורים אישיים.
5. לחצו על **ייצוא PDF** ושמרו דרך חלון ההדפסה של הדפדפן.

## Project layout / מבנה התיקייה

| Path | Purpose |
|---|---|
| `index.html` | Complete single-file application. |
| `docs/SPECIFICATION_EN.md` | Definitive English functional and technical specification. |
| `docs/SPECIFICATION_HE.md` | אפיון פונקציונלי וטכני מלא בעברית. |
| `docs/DESIGN_NOTES_HE.md` | Earlier Hebrew design notes and decision history. |
| `references/` | Original PowerPoint and PDF calendar documents used as visual references. |
| `tests/` | Playwright regression, edge-case, and print-clipping diagnostics. |
| `qa/` | Latest structured results, visual proof, and verified PDF examples. |
| `project-manifest.json` | Machine-readable project inventory and runtime facts. |

## Runtime and privacy

- The application has no build step and no private backend.
- Calendar data is requested from the official Hebcal REST API.
- Settings, notes, and up to ten recent calendar responses are stored only in the browser's `localStorage`.
- Personal notes are not sent to Hebcal.
- An internet connection is required for a new date range. A previously cached range remains available offline.

## Tests

Install Python 3.12+ and the dependencies listed in `tests/requirements.txt`, then run:

```powershell
Set-Location C:\yakir2026\hebrew-calendar-studio
.\run-tests.ps1
```

The tests launch the installed Google Chrome executable in headless mode and write screenshots and PDF evidence under `qa/`.

## Documentation

- English: [docs/SPECIFICATION_EN.md](docs/SPECIFICATION_EN.md)
- עברית: [docs/SPECIFICATION_HE.md](docs/SPECIFICATION_HE.md)

## Data attribution

Calendar, holiday, and Torah-reading data is provided by [Hebcal](https://www.hebcal.com/home/developer-apis). Content produced by the Hebcal APIs is licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Local customs should be confirmed with an appropriate religious authority.
