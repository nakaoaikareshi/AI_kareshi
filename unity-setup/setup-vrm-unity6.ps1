# Unity 6対応 VRMプロジェクトセットアップスクリプト

param(
    [string]$ProjectPath = ""
)

Write-Host "Unity 6 VRM Project Setup" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# プロジェクトパスの自動検出
if ($ProjectPath -eq "") {
    Write-Host "Searching for VRMCharacterCreator project..." -ForegroundColor Yellow
    
    # 一般的なUnityプロジェクトの場所を検索
    $possiblePaths = @(
        "C:\Users\$env:USERNAME\Unity Projects\VRMCharacterCreator",
        "C:\Users\$env:USERNAME\Documents\Unity Projects\VRMCharacterCreator",
        "C:\Unity Projects\VRMCharacterCreator",
        "D:\Unity Projects\VRMCharacterCreator",
        "C:\VRMCharacterCreator",
        "D:\VRMCharacterCreator"
    )
    
    foreach ($path in $possiblePaths) {
        if (Test-Path $path) {
            $ProjectPath = $path
            Write-Host "Found project at: $ProjectPath" -ForegroundColor Green
            break
        }
    }
}

# プロジェクト存在確認
if ($ProjectPath -eq "" -or !(Test-Path $ProjectPath)) {
    Write-Host "ERROR: VRMCharacterCreator project not found!" -ForegroundColor Red
    Write-Host "Please ensure the project is created in Unity Hub first." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Searched in:" -ForegroundColor Gray
    foreach ($path in $possiblePaths) {
        Write-Host "  - $path" -ForegroundColor Gray
    }
    exit 1
}

Write-Host "Project found!" -ForegroundColor Green
Set-Location $ProjectPath

# Packages/manifest.json を更新
$manifestPath = Join-Path $ProjectPath "Packages\manifest.json"
Write-Host "Updating manifest.json for Unity 6..." -ForegroundColor Yellow

$manifestContent = @'
{
  "dependencies": {
    "com.unity.collab-proxy": "2.5.2",
    "com.unity.feature.development": "1.0.2",
    "com.unity.textmeshpro": "3.2.0",
    "com.unity.timeline": "1.8.7",
    "com.unity.ugui": "2.0.0",
    "com.unity.visualscripting": "1.9.4",
    "com.unity.modules.ai": "1.0.0",
    "com.unity.modules.androidjni": "1.0.0",
    "com.unity.modules.animation": "1.0.0",
    "com.unity.modules.assetbundle": "1.0.0",
    "com.unity.modules.audio": "1.0.0",
    "com.unity.modules.cloth": "1.0.0",
    "com.unity.modules.director": "1.0.0",
    "com.unity.modules.imageconversion": "1.0.0",
    "com.unity.modules.imgui": "1.0.0",
    "com.unity.modules.jsonserialize": "1.0.0",
    "com.unity.modules.particlesystem": "1.0.0",
    "com.unity.modules.physics": "1.0.0",
    "com.unity.modules.physics2d": "1.0.0",
    "com.unity.modules.screencapture": "1.0.0",
    "com.unity.modules.terrain": "1.0.0",
    "com.unity.modules.terrainphysics": "1.0.0",
    "com.unity.modules.tilemap": "1.0.0",
    "com.unity.modules.ui": "1.0.0",
    "com.unity.modules.uielements": "1.0.0",
    "com.unity.modules.umbra": "1.0.0",
    "com.unity.modules.unityanalytics": "1.0.0",
    "com.unity.modules.unitywebrequest": "1.0.0",
    "com.unity.modules.unitywebrequestassetbundle": "1.0.0",
    "com.unity.modules.unitywebrequestaudio": "1.0.0",
    "com.unity.modules.unitywebrequesttexture": "1.0.0",
    "com.unity.modules.unitywebrequestwww": "1.0.0",
    "com.unity.modules.vehicles": "1.0.0",
    "com.unity.modules.video": "1.0.0",
    "com.unity.modules.vr": "1.0.0",
    "com.unity.modules.wind": "1.0.0",
    "com.unity.modules.xr": "1.0.0"
  },
  "scopedRegistries": [
    {
      "name": "VPM",
      "url": "https://vpm.nadena.dev/vpmrepo/curated",
      "scopes": [
        "com.vrmc",
        "nadena.dev"
      ]
    }
  ]
}
'@

$manifestContent | Set-Content $manifestPath -Encoding UTF8
Write-Host "Manifest updated!" -ForegroundColor Green

# UniVRMをPackage Managerから追加する手順を作成
$instructionsPath = Join-Path $ProjectPath "VRM_SETUP_INSTRUCTIONS.txt"
$instructions = @'
===========================================
Unity 6 VRM Setup Instructions
===========================================

1. Unity Editor で以下を実行:

   Window > Package Manager を開く
   
2. Package Manager で:
   
   左上の [+] ボタン > "Add package from git URL..."
   
3. 以下のURLを順番に追加:

   https://github.com/vrm-c/UniVRM.git?path=/Assets/VRMShaders#v0.120.0
   https://github.com/vrm-c/UniVRM.git?path=/Assets/UniGLTF#v0.120.0
   https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM#v0.120.0
   https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM10#v0.120.0

4. インポート完了後:

   Assets フォルダで右クリック
   Create > Folder > "Scripts"
   Scripts フォルダ内に CharacterCreator.cs をコピー

5. メニューバーに "Tools > VRM Character Creator" が表示されます！

===========================================
'@

$instructions | Set-Content $instructionsPath -Encoding UTF8

# プロジェクト構造作成
$assetsPath = Join-Path $ProjectPath "Assets"
Write-Host "Creating project structure..." -ForegroundColor Yellow

$directories = @(
    "Models",
    "Models\Characters",
    "Materials",
    "Textures",
    "Animations",
    "Scripts",
    "Scripts\Character",
    "Prefabs",
    "VRM_Exports"
)

foreach ($dir in $directories) {
    $fullPath = Join-Path $assetsPath $dir
    if (!(Test-Path $fullPath)) {
        New-Item -ItemType Directory -Path $fullPath -Force | Out-Null
        Write-Host "  Created: $dir" -ForegroundColor Gray
    }
}

# CharacterCreator.csをコピー
$sourceScript = Join-Path (Split-Path $PSScriptRoot) "CharacterCreator.cs"
$targetScript = Join-Path $assetsPath "Scripts\Character\CharacterCreator.cs"

if (Test-Path $sourceScript) {
    Copy-Item $sourceScript $targetScript -Force
    Write-Host "CharacterCreator.cs copied to project!" -ForegroundColor Green
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Return to Unity Editor" -ForegroundColor White
Write-Host "2. Open Window > Package Manager" -ForegroundColor White
Write-Host "3. Add VRM packages using git URLs (see VRM_SETUP_INSTRUCTIONS.txt)" -ForegroundColor White
Write-Host "4. Use Tools > VRM Character Creator" -ForegroundColor White
Write-Host ""
Write-Host "Instructions saved to: $instructionsPath" -ForegroundColor Gray