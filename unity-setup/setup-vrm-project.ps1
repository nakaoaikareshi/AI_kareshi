# Unity VRMプロジェクト自動セットアップスクリプト
# Unity Hubでプロジェクトを作成後に実行してください

param(
    [string]$ProjectPath = "C:\Users\$env:USERNAME\Unity Projects\VRMCharacterCreator"
)

Write-Host "VRMプロジェクトのセットアップを開始します..." -ForegroundColor Green
Write-Host "プロジェクトパス: $ProjectPath" -ForegroundColor Cyan

# プロジェクトが存在するか確認
if (!(Test-Path $ProjectPath)) {
    Write-Host "エラー: プロジェクトが見つかりません。" -ForegroundColor Red
    Write-Host "Unity Hubで 'VRMCharacterCreator' プロジェクトを作成してください。" -ForegroundColor Yellow
    exit 1
}

# Packagesフォルダに移動
$packagesPath = Join-Path $ProjectPath "Packages"
Set-Location $packagesPath

# manifest.jsonを更新してUniVRMを追加
Write-Host "UniVRM (VRMサポート)をインストール中..." -ForegroundColor Yellow
$manifestPath = Join-Path $packagesPath "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json

# UniVRM 0.114.0を追加
$manifest.dependencies | Add-Member -Name "com.vrmc.gltf" -Value "https://github.com/vrm-c/UniVRM.git?path=/Assets/UniGLTF#v0.114.0" -MemberType NoteProperty -Force
$manifest.dependencies | Add-Member -Name "com.vrmc.vrm" -Value "https://github.com/vrm-c/UniVRM.git?path=/Assets/VRM10#v0.114.0" -MemberType NoteProperty -Force
$manifest.dependencies | Add-Member -Name "com.vrmc.vrmshaders" -Value "https://github.com/vrm-c/UniVRM.git?path=/Assets/VRMShaders#v0.114.0" -MemberType NoteProperty -Force
$manifest.dependencies | Add-Member -Name "com.vrmc.unigltf" -Value "https://github.com/vrm-c/UniVRM.git?path=/Assets/UniGLTF#v0.114.0" -MemberType NoteProperty -Force

$manifest | ConvertTo-Json -Depth 10 | Set-Content $manifestPath
Write-Host "UniVRMの追加完了！" -ForegroundColor Green

# Assetsフォルダに必要なディレクトリを作成
$assetsPath = Join-Path $ProjectPath "Assets"
Write-Host "プロジェクト構造を作成中..." -ForegroundColor Yellow

$directories = @(
    "Models",
    "Models\Characters",
    "Models\Characters\Base",
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
        Write-Host "  作成: $dir" -ForegroundColor Gray
    }
}

Write-Host "プロジェクト構造の作成完了！" -ForegroundColor Green

# キャラクタースクリプトのテンプレートを作成
Write-Host "キャラクター作成スクリプトを生成中..." -ForegroundColor Yellow