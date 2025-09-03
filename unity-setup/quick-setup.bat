@echo off
echo ======================================
echo VRM Project Quick Setup
echo ======================================
echo.

REM Check if project exists
set PROJECT_PATH=%USERPROFILE%\Unity Projects\VRMCharacterCreator
if not exist "%PROJECT_PATH%" (
    echo ERROR: VRMCharacterCreator project not found!
    echo Please create the project in Unity Hub first.
    pause
    exit /b 1
)

echo Project found at: %PROJECT_PATH%
echo.

REM Run PowerShell setup script
echo Running VRM setup...
powershell -ExecutionPolicy Bypass -File "setup-vrm-project.ps1"

echo.
echo ======================================
echo Setup Complete!
echo ======================================
echo.
echo Next steps:
echo 1. Return to Unity Editor
echo 2. Wait for package import to complete
echo 3. Copy CharacterCreator.cs to:
echo    %PROJECT_PATH%\Assets\Scripts\Character\
echo 4. In Unity: Tools -^> VRM Character Creator
echo.
pause