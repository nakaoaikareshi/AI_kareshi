# Unity Package Manager 自動化スクリプト
# Unity EditorのPackage Managerに VRMパッケージを自動追加

param(
    [string]$ProjectPath = "C:\Users\m_fun\VRMCharacterCreator"
)

Write-Host "==================================" -ForegroundColor Cyan
Write-Host "UniVRM Auto Package Installer" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan
Write-Host ""

# manifest.json のパス
$manifestPath = Join-Path $ProjectPath "Packages\manifest.json"

if (!(Test-Path $manifestPath)) {
    Write-Host "ERROR: manifest.json not found at: $manifestPath" -ForegroundColor Red
    exit 1
}

Write-Host "Adding UniVRM packages to manifest.json..." -ForegroundColor Yellow

# 現在のmanifest.jsonを読み込み
$manifestContent = Get-Content $manifestPath -Raw | ConvertFrom-Json

# VRMパッケージを依存関係に追加
$vrmPackages = @{
    "com.vrmc.vrmshaders" = "https://github.com/vrm-c/UniVRM.git?path=/Assets/VRMShaders#v0.120.0"
    "com.vrmc.unigltf" = "https://github.com/vrm-c/UniVRM.git?path=/Assets/UniGLTF#v0.120.0"
    "com.vrmc.univrm" = "https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM#v0.120.0"
    "com.vrmc.vrm" = "https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM10#v0.120.0"
}

# 依存関係を更新
foreach ($package in $vrmPackages.GetEnumerator()) {
    $manifestContent.dependencies | Add-Member -MemberType NoteProperty -Name $package.Key -Value $package.Value -Force
    Write-Host "  Added: $($package.Key)" -ForegroundColor Green
}

# manifest.jsonを保存
$manifestContent | ConvertTo-Json -Depth 10 | Set-Content $manifestPath -Encoding UTF8

Write-Host ""
Write-Host "✅ VRM packages added successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "Unity will now reload and import the packages..." -ForegroundColor Yellow
Write-Host "This may take 1-2 minutes." -ForegroundColor Yellow
Write-Host ""
Write-Host "After Unity finishes importing:" -ForegroundColor Cyan
Write-Host "1. Check Console for any errors" -ForegroundColor White
Write-Host "2. The VRM menu should appear in the menu bar" -ForegroundColor White
Write-Host ""

# CharacterCreator.csをコピー
$sourceScript = Join-Path (Split-Path $PSScriptRoot) "CharacterCreator.cs"
$targetScript = Join-Path $ProjectPath "Assets\Scripts\Character\CharacterCreator.cs"

if (Test-Path $sourceScript) {
    # Scripts/Characterフォルダが存在しない場合は作成
    $targetDir = Split-Path $targetScript
    if (!(Test-Path $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }
    
    Copy-Item $sourceScript $targetScript -Force
    Write-Host "✅ CharacterCreator.cs copied to project!" -ForegroundColor Green
    Write-Host "   Location: Assets/Scripts/Character/CharacterCreator.cs" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📌 After import completes:" -ForegroundColor Yellow
    Write-Host "   Menu bar → Tools → VRM Character Creator" -ForegroundColor White
} else {
    Write-Host "⚠️ CharacterCreator.cs not found" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "==================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "==================================" -ForegroundColor Cyan