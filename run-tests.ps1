$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonExecutable = "python"
$env:PYTHONUTF8 = "1"

Write-Host "Running core application regression tests..."
& $pythonExecutable "$projectRoot\tests\test_app.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running layout, print, and overflow edge-case tests..."
& $pythonExecutable "$projectRoot\tests\test_layout_extremes.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Running focused print-clipping diagnostics..."
& $pythonExecutable "$projectRoot\tests\diagnose_print_clipping.py"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "All tests passed. QA artifacts are available under $projectRoot\qa."
