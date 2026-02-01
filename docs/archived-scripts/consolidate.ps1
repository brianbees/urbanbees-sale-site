# Urban Bees Consolidation Script
# Safely copies files from two source folders into consolidated structure
# Date: January 30, 2026

# Set strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

# Define paths
$targetRoot = "F:\Files_Folders\01 - Urban Bees website\001-RP-sale-site"
$sourceFrontend = "F:\Files_Folders\01 - Urban Bees website\park_sales_website\urbanbees-website"
$sourceAdmin = "F:\Files_Folders\01 - Urban Bees website\rpsale\urbanbees-product-admin"

Write-Host "=== Urban Bees Consolidation Script ===" -ForegroundColor Cyan
Write-Host "Target: $targetRoot" -ForegroundColor Yellow
Write-Host ""

# Verify source folders exist
if (-not (Test-Path $sourceFrontend)) {
    Write-Host "ERROR: Frontend source not found: $sourceFrontend" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $sourceAdmin)) {
    Write-Host "ERROR: Admin source not found: $sourceAdmin" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Source folders verified" -ForegroundColor Green
Write-Host ""

# Phase 1: Create directory structure
Write-Host "[Phase 1] Creating directory structure..." -ForegroundColor Green
$directories = @(
    "$targetRoot\frontend",
    "$targetRoot\admin",
    "$targetRoot\docs",
    "$targetRoot\scripts"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -Path $dir -ItemType Directory -Force | Out-Null
        Write-Host "  ✓ Created: $dir" -ForegroundColor Gray
    } else {
        Write-Host "  - Exists: $dir" -ForegroundColor DarkGray
    }
}

# Phase 2: Copy Frontend (park_sales_website)
Write-Host "`n[Phase 2] Copying Frontend files..." -ForegroundColor Green

# Frontend source files
$frontendCopies = @(
    @{ Source = "$sourceFrontend\src"; Dest = "$targetRoot\frontend\src"; Recurse = $true },
    @{ Source = "$sourceFrontend\public"; Dest = "$targetRoot\frontend\public"; Recurse = $true },
    @{ Source = "$sourceFrontend\package.json"; Dest = "$targetRoot\frontend\package.json" },
    @{ Source = "$sourceFrontend\package-lock.json"; Dest = "$targetRoot\frontend\package-lock.json" },
    @{ Source = "$sourceFrontend\next.config.ts"; Dest = "$targetRoot\frontend\next.config.ts" },
    @{ Source = "$sourceFrontend\tsconfig.json"; Dest = "$targetRoot\frontend\tsconfig.json" },
    @{ Source = "$sourceFrontend\tailwind.config.js"; Dest = "$targetRoot\frontend\tailwind.config.js" },
    @{ Source = "$sourceFrontend\postcss.config.mjs"; Dest = "$targetRoot\frontend\postcss.config.mjs" },
    @{ Source = "$sourceFrontend\postcss.config.js"; Dest = "$targetRoot\frontend\postcss.config.js" },
    @{ Source = "$sourceFrontend\eslint.config.mjs"; Dest = "$targetRoot\frontend\eslint.config.mjs" },
    @{ Source = "$sourceFrontend\next-env.d.ts"; Dest = "$targetRoot\frontend\next-env.d.ts" },
    @{ Source = "$sourceFrontend\.gitignore"; Dest = "$targetRoot\frontend\.gitignore" },
    @{ Source = "$sourceFrontend\README.md"; Dest = "$targetRoot\frontend\README.md" }
)

foreach ($copy in $frontendCopies) {
    if (Test-Path $copy.Source) {
        try {
            if ($copy.ContainsKey('Recurse') -and $copy.Recurse) {
                Copy-Item -Path $copy.Source -Destination $copy.Dest -Recurse -Force
                $itemCount = (Get-ChildItem -Path $copy.Dest -Recurse -File).Count
                Write-Host "  ✓ Copied (recursive): $(Split-Path $copy.Source -Leaf) [$itemCount files]" -ForegroundColor Gray
            } else {
                Copy-Item -Path $copy.Source -Destination $copy.Dest -Force
                Write-Host "  ✓ Copied: $(Split-Path $copy.Source -Leaf)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ✗ Failed: $(Split-Path $copy.Source -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Missing: $(Split-Path $copy.Source -Leaf)" -ForegroundColor Yellow
    }
}

# Phase 3: Copy Documentation
Write-Host "`n[Phase 3] Copying Documentation files..." -ForegroundColor Green

$docFiles = @(
    "$sourceFrontend\FIXES_SUMMARY.txt",
    "$sourceFrontend\IMAGE_MAPPING.md",
    "$sourceFrontend\IMAGES_READY.md",
    "$sourceFrontend\TODO.md"
)

foreach ($file in $docFiles) {
    if (Test-Path $file) {
        try {
            Copy-Item -Path $file -Destination "$targetRoot\docs\" -Force
            Write-Host "  ✓ Copied: $(Split-Path $file -Leaf)" -ForegroundColor Gray
        } catch {
            Write-Host "  ✗ Failed: $(Split-Path $file -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Missing: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# Phase 4: Copy Scripts
Write-Host "`n[Phase 4] Copying Scripts..." -ForegroundColor Green

$scriptFiles = @(
    "$sourceFrontend\copy-product-images.ps1"
)

foreach ($file in $scriptFiles) {
    if (Test-Path $file) {
        try {
            Copy-Item -Path $file -Destination "$targetRoot\scripts\" -Force
            Write-Host "  ✓ Copied: $(Split-Path $file -Leaf)" -ForegroundColor Gray
        } catch {
            Write-Host "  ✗ Failed: $(Split-Path $file -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Missing: $(Split-Path $file -Leaf)" -ForegroundColor Yellow
    }
}

# Phase 5: Copy Admin (rpsale)
Write-Host "`n[Phase 5] Copying Admin files..." -ForegroundColor Green

$adminCopies = @(
    @{ Source = "$sourceAdmin\app"; Dest = "$targetRoot\admin\app"; Recurse = $true },
    @{ Source = "$sourceAdmin\lib"; Dest = "$targetRoot\admin\lib"; Recurse = $true },
    @{ Source = "$sourceAdmin\public"; Dest = "$targetRoot\admin\public"; Recurse = $true },
    @{ Source = "$sourceAdmin\package.json"; Dest = "$targetRoot\admin\package.json" },
    @{ Source = "$sourceAdmin\package-lock.json"; Dest = "$targetRoot\admin\package-lock.json" },
    @{ Source = "$sourceAdmin\next.config.ts"; Dest = "$targetRoot\admin\next.config.ts" },
    @{ Source = "$sourceAdmin\tsconfig.json"; Dest = "$targetRoot\admin\tsconfig.json" },
    @{ Source = "$sourceAdmin\postcss.config.mjs"; Dest = "$targetRoot\admin\postcss.config.mjs" },
    @{ Source = "$sourceAdmin\eslint.config.mjs"; Dest = "$targetRoot\admin\eslint.config.mjs" },
    @{ Source = "$sourceAdmin\next-env.d.ts"; Dest = "$targetRoot\admin\next-env.d.ts" },
    @{ Source = "$sourceAdmin\.gitignore"; Dest = "$targetRoot\admin\.gitignore" },
    @{ Source = "$sourceAdmin\README.md"; Dest = "$targetRoot\admin\README.md" }
)

foreach ($copy in $adminCopies) {
    if (Test-Path $copy.Source) {
        try {
            if ($copy.ContainsKey('Recurse') -and $copy.Recurse) {
                Copy-Item -Path $copy.Source -Destination $copy.Dest -Recurse -Force
                $itemCount = (Get-ChildItem -Path $copy.Dest -Recurse -File).Count
                Write-Host "  ✓ Copied (recursive): $(Split-Path $copy.Source -Leaf) [$itemCount files]" -ForegroundColor Gray
            } else {
                Copy-Item -Path $copy.Source -Destination $copy.Dest -Force
                Write-Host "  ✓ Copied: $(Split-Path $copy.Source -Leaf)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  ✗ Failed: $(Split-Path $copy.Source -Leaf) - $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  ⚠ Missing: $(Split-Path $copy.Source -Leaf)" -ForegroundColor Yellow
    }
}

# Phase 6: Copy .env.local (with warning)
Write-Host "`n[Phase 6] Copying Environment Variables..." -ForegroundColor Green

if (Test-Path "$sourceAdmin\.env.local") {
    try {
        Copy-Item -Path "$sourceAdmin\.env.local" -Destination "$targetRoot\admin\.env.local" -Force
        Write-Host "  ✓ Copied: .env.local" -ForegroundColor Gray
        Write-Host "  ⚠ WARNING: Review and update Supabase credentials in admin\.env.local!" -ForegroundColor Yellow
    } catch {
        Write-Host "  ✗ Failed: .env.local - $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠ Missing: .env.local" -ForegroundColor Yellow
    Write-Host "    You'll need to create admin\.env.local manually with:" -ForegroundColor Yellow
    Write-Host "    NEXT_PUBLIC_SUPABASE_URL=your_url" -ForegroundColor DarkGray
    Write-Host "    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key" -ForegroundColor DarkGray
}

# Generate summary report
Write-Host "`n=== Consolidation Summary ===" -ForegroundColor Cyan

$frontendFiles = if (Test-Path "$targetRoot\frontend") { (Get-ChildItem -Path "$targetRoot\frontend" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
$adminFiles = if (Test-Path "$targetRoot\admin") { (Get-ChildItem -Path "$targetRoot\admin" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
$docFiles = if (Test-Path "$targetRoot\docs") { (Get-ChildItem -Path "$targetRoot\docs" -File -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }
$scriptFiles = if (Test-Path "$targetRoot\scripts") { (Get-ChildItem -Path "$targetRoot\scripts" -File -ErrorAction SilentlyContinue | Measure-Object).Count } else { 0 }

Write-Host "Frontend files: $frontendFiles" -ForegroundColor White
Write-Host "Admin files: $adminFiles" -ForegroundColor White
Write-Host "Documentation files: $docFiles" -ForegroundColor White
Write-Host "Script files: $scriptFiles" -ForegroundColor White
Write-Host "Total files: $($frontendFiles + $adminFiles + $docFiles + $scriptFiles)" -ForegroundColor Green

Write-Host "`nTarget location: $targetRoot" -ForegroundColor Cyan
Write-Host ""

# Next steps
Write-Host "=== Next Steps ===" -ForegroundColor Yellow
Write-Host "1. Review admin\.env.local credentials (if copied)" -ForegroundColor White
Write-Host "2. Install frontend dependencies:" -ForegroundColor White
Write-Host "   cd `"$targetRoot\frontend`"" -ForegroundColor DarkGray
Write-Host "   npm install" -ForegroundColor DarkGray
Write-Host ""
Write-Host "3. Install admin dependencies:" -ForegroundColor White
Write-Host "   cd `"$targetRoot\admin`"" -ForegroundColor DarkGray
Write-Host "   npm install" -ForegroundColor DarkGray
Write-Host ""
Write-Host "4. Test frontend build:" -ForegroundColor White
Write-Host "   cd frontend && npm run dev" -ForegroundColor DarkGray
Write-Host ""
Write-Host "5. Test admin build:" -ForegroundColor White
Write-Host "   cd admin && npm run dev" -ForegroundColor DarkGray
Write-Host ""
Write-Host "6. Review documentation in docs\ folder" -ForegroundColor White
Write-Host ""
Write-Host "✓ Consolidation complete!" -ForegroundColor Green
