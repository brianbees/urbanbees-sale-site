# Path to your old project images folder
$old = "F:\Files_Folders\01 - Urban Bees website\sale\public\images"
# Path to your new project images folder
$new = "F:\Files_Folders\01 - Urban Bees website\park_sales_website\urbanbees-website\public\images"

# Ensure destination folder exists
if (!(Test-Path $new)) {
    New-Item -ItemType Directory -Path $new | Out-Null
}

# Extract all image filenames referenced in products.ts
$productsFile = "src\data\products.ts"


# FIXED REGEX — captures full filename after /images/
$pattern = '/images/([^"]+)'



$matches = Select-String -Path $productsFile -Pattern $pattern -AllMatches |
    ForEach-Object { $_.Matches } |
    ForEach-Object { $_.Groups[1].Value } |
    Sort-Object -Unique

Write-Host "Found $($matches.Count) image references in products.ts"
Write-Host ""

foreach ($file in $matches) {
    $source = Join-Path $old $file
    $dest = Join-Path $new $file

    if (Test-Path $source) {
        Copy-Item $source $dest -Force
        Write-Host "Copied: $file"
    } else {
        Write-Host "MISSING in old project: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Done."
