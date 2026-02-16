# Copy the Morning Focus app icon to public folder for PWA / Add to Home Screen
# Run from project root. Source: Cursor assets (or set your own path).

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir
$sourcePath = Join-Path $projectRoot "assets\c__Users_jkasa_AppData_Roaming_Cursor_User_workspaceStorage_ff5cc0e9b01c5ab0fffdfb2d12cac920_images_Gemini_Generated_Image_q0fr2jq0fr2jq0fr-6d9f6206-4b9c-4aea-a9e6-833a68bbfbc6.png"

if (-not (Test-Path $sourcePath)) {
    Write-Host "Icon not found at: $sourcePath"
    Write-Host "Please update `$sourcePath in this script to point to your icon image."
    exit 1
}

$destDir = Join-Path $projectRoot "public"
New-Item -ItemType Directory -Force -Path $destDir | Out-Null

Copy-Item $sourcePath "$destDir\icon-192.png"
Copy-Item $sourcePath "$destDir\icon-512.png"
Copy-Item $sourcePath "$destDir\apple-icon.png"

Write-Host "Icon copied to public/icon-192.png, icon-512.png, apple-icon.png"
