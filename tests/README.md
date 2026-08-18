# Test suite

The tests open `../index.html` directly in a Chromium-based browser and write
their evidence under `../qa/`.

## Setup

```powershell
python -m pip install -r .\tests\requirements.txt
```

Google Chrome is used by default. To select another Chromium executable:

```powershell
$env:CHROME_PATH = "C:\path\to\chrome.exe"
```

## Run all tests

```powershell
.\run-tests.ps1
```

The suite covers core UI behavior, Hebrew/RTL calendar generation, manual day
notes, online/cache/error states, A4/A3 single-page fitting, explicit
multi-page output, equal cell sizing, overflow handling, and print clipping.
