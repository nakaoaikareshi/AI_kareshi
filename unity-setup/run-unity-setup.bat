@echo off
echo Starting Unity Hub installation...
echo.
echo This will download and install Unity Hub automatically.
echo Please wait...
echo.

REM Download Unity Hub
echo Downloading Unity Hub...
powershell -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://public-cdn.cloud.unity3d.com/hub/prod/UnityHubSetup.exe' -OutFile '%TEMP%\UnityHubSetup.exe'"

if not exist "%TEMP%\UnityHubSetup.exe" (
    echo ERROR: Download failed!
    pause
    exit /b 1
)

echo Download complete!
echo.

REM Install Unity Hub silently
echo Installing Unity Hub...
"%TEMP%\UnityHubSetup.exe" /S

echo.
echo Installation in progress...
timeout /t 10 /nobreak > nul

REM Check if Unity Hub was installed
if exist "%LOCALAPPDATA%\Programs\Unity Hub\Unity Hub.exe" (
    echo Unity Hub installed successfully!
    echo.
    echo Launching Unity Hub...
    start "" "%LOCALAPPDATA%\Programs\Unity Hub\Unity Hub.exe"
    echo.
    echo ===================================
    echo NEXT STEPS:
    echo 1. Login with your Unity account
    echo 2. Go to 'Installs' tab
    echo 3. Click 'Install Editor'
    echo 4. Select Unity 2022.3 LTS
    echo 5. After Unity installation, create new project
    echo    - Template: 3D Core
    echo    - Project name: VRMCharacterCreator
    echo ===================================
) else (
    echo Unity Hub installation location not found.
    echo Please check if installation completed.
)

echo.
pause