# Unity Hub Auto Installation Script (Windows PowerShell)
# Run with Administrator privileges

Write-Host "Starting Unity Hub setup..." -ForegroundColor Green

# Download Unity Hub
$unityHubUrl = "https://public-cdn.cloud.unity3d.com/hub/prod/UnityHubSetup.exe"
$downloadPath = "$env:TEMP\UnityHubSetup.exe"

Write-Host "Downloading Unity Hub..." -ForegroundColor Yellow
try {
    Invoke-WebRequest -Uri $unityHubUrl -OutFile $downloadPath
    Write-Host "Download complete!" -ForegroundColor Green
}
catch {
    Write-Host "Download error: $_" -ForegroundColor Red
    exit 1
}

# Install Unity Hub
Write-Host "Installing Unity Hub..." -ForegroundColor Yellow
Start-Process -FilePath $downloadPath -ArgumentList "/S" -Wait
Write-Host "Installation complete!" -ForegroundColor Green

# Launch Unity Hub
Write-Host "Launching Unity Hub..." -ForegroundColor Yellow
$unityHubPath = "$env:LOCALAPPDATA\Programs\Unity Hub\Unity Hub.exe"
if (Test-Path $unityHubPath) {
    Start-Process $unityHubPath
    Write-Host "Unity Hub launched successfully!" -ForegroundColor Green
}
else {
    Write-Host "Failed to launch Unity Hub. Please start it manually." -ForegroundColor Red
}

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Login with Unity account in Unity Hub" -ForegroundColor White
Write-Host "2. Install Unity 2022.3 LTS from 'Installs' tab" -ForegroundColor White
Write-Host "3. Click 'New project' in 'Projects' tab" -ForegroundColor White
Write-Host "4. Select '3D Core' template" -ForegroundColor White
Write-Host "5. Set project name as 'VRMCharacterCreator'" -ForegroundColor White
Write-Host "`nAfter setup, run setup-vrm-project.ps1" -ForegroundColor Yellow