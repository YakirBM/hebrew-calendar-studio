# Hebrew Calendar Studio / סדר יום

**Public site / אתר ציבורי:** [https://hebrew-calendar-studio.vercel.app](https://hebrew-calendar-studio.vercel.app)

An RTL-first Next.js application for creating accurate Hebrew/Gregorian calendar grids and exporting them as print-ready A4 or A3 PDFs. The interface supports Israel and Diaspora conventions, holidays, fasts, Rosh Chodesh, weekly Torah portions, Israeli state observances, external events, and private date-specific notes.

יישום Next.js מלא בעברית וב־RTL ליצירת לוחות עבריים מדויקים ומותאמים אישית. ניתן לבחור טווח, מנהג ישראל או חו״ל, A4 או A3, כיוון אנכי או אופקי, תוכן, צבעים וטיפוגרפיה, להוסיף אזכורים בלחיצה על יום, ולשמור PDF דרך חלון ההדפסה.

## Main capabilities / יכולות עיקריות

- Seven equal RTL columns: Sunday on the right and Saturday on the left.
- Reliable calendar data through a server-side Hebcal proxy with daily caching and validation.
- A4/A3, portrait/landscape, single-page default, and explicit multi-page mode.
- Automatic preview fit and per-cell font fitting; export is blocked if text would still be clipped.
- Clear positive network indication plus exact-range offline cache.
- Private personal notes stored only in browser IndexedDB.
- Versioned project import/export as JSON.
- Touch-first mobile week view with seven readable day cards, week navigation, a safe-area-aware bottom action bar, and one-tap access to the exact physical-page preview.
- Responsive settings drawer with compact accordions and a full-screen mobile day editor.
- Strict TypeScript, unit tests, Playwright desktop/mobile tests, and production builds.

## Local development / פיתוח מקומי

Requirements: Node.js 22 or newer and npm.

```powershell
Set-Location C:\yakir2026\hebrew-calendar-studio
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification / בדיקות

```powershell
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

`npm run verify` runs lint, type checking, unit tests, and the production build. Playwright additionally validates equal cells, long-text export blocking, A3 landscape, 320 px portrait, phone landscape, 768 px tablet behavior, mobile touch targets, personal notes, and exact one-page A4 PDF output.

## Project structure / מבנה הפרויקט

| Path | Purpose |
|---|---|
| `src/app/` | Next.js App Router pages, metadata, and calendar API route |
| `src/domain/` | Pure calendar and print-layout rules |
| `src/application/` | Calendar orchestration and project-file use cases |
| `src/infrastructure/` | Hebcal adapter and browser storage repositories |
| `src/components/` | Modular RTL UI, preview, settings, and day editor |
| `src/state/` | Zustand settings and calendar stores |
| `src/styles/` | Design tokens, responsive UI, calendar, and print CSS |
| `tests/unit/` | Deterministic domain tests |
| `tests/e2e/` | Playwright desktop, mobile, overflow, and PDF tests |
| `docs/ARCHITECTURE.md` | Full English architecture document |
| `docs/ARCHITECTURE_HE.md` | מסמך ארכיטקטורה מלא בעברית |
| `docs/SPECIFICATION_EN.md` | Full English product specification |
| `docs/SPECIFICATION_HE.md` | מסמך אפיון מוצר מלא בעברית |
| `legacy/` | Archived original standalone implementation after migration |
| `references/` | Original PowerPoint and PDF visual references |

## Runtime, privacy, and accuracy

The browser requests `/api/calendar`; the Next.js server validates the range, aligns it to full weeks, and retrieves Hebrew calendar data from Hebcal. Settings remain in versioned localStorage. Personal notes and up to ten exact-range calendar responses remain in IndexedDB and are never sent to Hebcal or Vercel.

The calendar follows Hebcal data and is intended as a planning and printing tool, not as an independent halachic authority. Israel/Diaspora differences are selected explicitly. Hebrew leap months and two-day Rosh Chodesh are derived from the upstream calendar rather than calculated with handwritten tables.

Calendar data is provided by [Hebcal](https://www.hebcal.com/home/developer-apis) under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
