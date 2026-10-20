# Builds the cPanel standalone package for the Belaview client.
# Usage: npm run pack:cpanel
#   -SkipBuild   reuse the existing .next build
#   -KeepStage   keep the temporary staging folder for inspection
param(
  [switch]$SkipBuild,
  [switch]$KeepStage
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$standalone = Join-Path $root ".next\standalone"
$stage = Join-Path $env:TEMP "belaview-client-cpanel-pack"
$combined = Join-Path $root "belaview-client-cpanel.zip"
$appZip = Join-Path $root "belaview-client-app.zip"
$publicZip = Join-Path $root "belaview-client-public.zip"

if (-not $SkipBuild) {
  $env:NODE_ENV = "production"
  $env:BETTER_AUTH_URL = "https://belaviewbd.com"
  $env:SERVER_URL = "https://api.belaviewbd.com"
  Push-Location $root
  try {
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "next build failed with exit code $LASTEXITCODE" }
  } finally {
    Pop-Location
  }
}

if (-not (Test-Path (Join-Path $standalone "server.js"))) {
  throw "Standalone output not found at $standalone. Run npm run build first."
}

if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null

# Copy the standalone server, its traced node_modules and .next output.
Get-ChildItem $standalone -Force | ForEach-Object {
  Copy-Item $_.FullName -Destination $stage -Recurse -Force
}

# Next standalone copies the loaded .env file into the output. Never ship it.
Get-ChildItem $stage -Force -File | Where-Object { $_.Name -like ".env*" } | Remove-Item -Force

# Next does not copy these two folders into standalone automatically.
$publicSource = Join-Path $root "public"
if (Test-Path $publicSource) {
  Copy-Item $publicSource -Destination (Join-Path $stage "public") -Recurse -Force
}
Copy-Item (Join-Path $root ".next\static") -Destination (Join-Path $stage ".next\static") -Recurse -Force

# Keep the runtime config next to server.js for transparency. The generated
# server embeds the same config in required-server-files.json.
Copy-Item (Join-Path $root "next.config.mjs") -Destination (Join-Path $stage "next.config.mjs") -Force

# Portability gate: the build machine is Windows, the server is Linux.
$native = Get-ChildItem $stage -Recurse -File -Filter *.node -ErrorAction SilentlyContinue
if ($native) {
  $names = ($native | ForEach-Object { $_.FullName.Substring($stage.Length + 1) }) -join ", "
  throw "Standalone output contains native binaries that may not run on cPanel: $names"
}
$sharpDir = Join-Path $stage "node_modules\sharp"
$imgDir = Join-Path $stage "node_modules\@img"
if ((Test-Path $sharpDir) -or (Test-Path $imgDir)) {
  throw "Standalone output still contains sharp/@img. Rebuild with images.unoptimized and outputFileTracingExcludes."
}
$windowsSwc = Get-ChildItem (Join-Path $stage "node_modules\@next") -Directory -ErrorAction SilentlyContinue |
  Where-Object { $_.Name -like "swc-win32-*" }
if ($windowsSwc) {
  throw "Standalone output contains a Windows SWC binary."
}

foreach ($required in @("server.js", "package.json", ".next", "node_modules", "public")) {
  if (-not (Test-Path (Join-Path $stage $required))) {
    throw "Packaging failed: $required is missing from the stage."
  }
}
if (Get-ChildItem $stage -Force -File | Where-Object { $_.Name -like ".env*" }) {
  throw "Packaging failed: .env is still present in the stage."
}

Add-Type -AssemblyName System.IO.Compression.FileSystem

function New-CpanelZip {
  param(
    [string]$Destination,
    [string[]]$Sources
  )
  if (Test-Path $Destination) { Remove-Item $Destination -Force }
  Push-Location $stage
  try {
    # bsdtar (Windows tar) writes forward-slash ZIP entries, unlike
    # Compress-Archive which writes backslashes that break Linux extraction.
    & tar -a -c -f $Destination @Sources
    if ($LASTEXITCODE -ne 0) { throw "tar failed creating $Destination (exit $LASTEXITCODE)" }
  } finally {
    Pop-Location
  }
}

function Assert-ForwardSlashZip {
  param([string]$Path)
  $zip = [System.IO.Compression.ZipFile]::OpenRead($Path)
  try {
    $bad = @($zip.Entries | Where-Object { $_.FullName.Contains("\") })
    if ($bad.Count -gt 0) {
      throw "ZIP contains backslash entry names and is not safe for cPanel: $($bad[0].FullName)"
    }
  } finally {
    $zip.Dispose()
  }
}

foreach ($path in @($combined, $appZip, $publicZip)) {
  if (Test-Path $path) { Remove-Item $path -Force }
}

$topLevelSources = Get-ChildItem $stage -Force | Select-Object -ExpandProperty Name
New-CpanelZip -Destination $combined -Sources $topLevelSources
Assert-ForwardSlashZip -Path $combined

$combinedSize = (Get-Item $combined).Length
if ($combinedSize -gt 45MB) {
  # cPanel File Manager uploads are commonly capped around 50 MB. Provide a
  # two-part package and upload/extract both into the same app root.
  New-CpanelZip -Destination $appZip -Sources @(
    "server.js",
    "package.json",
    "next.config.mjs",
    "node_modules",
    ".next"
  )
  New-CpanelZip -Destination $publicZip -Sources @("public")
  Assert-ForwardSlashZip -Path $appZip
  Assert-ForwardSlashZip -Path $publicZip
  Write-Host "Combined zip is larger than 45 MB. Split packages created:"
  Write-Host ("  {0} ({1:N1} MB)" -f $appZip, ((Get-Item $appZip).Length / 1MB))
  Write-Host ("  {0} ({1:N1} MB)" -f $publicZip, ((Get-Item $publicZip).Length / 1MB))
}

$hash = (Get-FileHash $combined -Algorithm SHA256).Hash
Write-Host ""
Write-Host ("Created {0}" -f $combined)
Write-Host ("Size: {0:N0} bytes ({1:N1} MB)" -f $combinedSize, ($combinedSize / 1MB))
Write-Host ("SHA256: {0}" -f $hash)
Write-Host ("Staging folder: {0}" -f $stage)

if (-not $KeepStage) {
  Remove-Item $stage -Recurse -Force
}
