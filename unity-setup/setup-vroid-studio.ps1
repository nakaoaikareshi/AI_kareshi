# VRoid Studio セットアップスクリプト

Write-Host "================================" -ForegroundColor Cyan
Write-Host "VRoid Studio Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# VRoid Studioのダウンロード
$vroidUrl = "https://vroid.com/studio"
$downloadPath = "$env:USERPROFILE\Downloads"

Write-Host "VRoid Studioのセットアップを開始します..." -ForegroundColor Yellow
Write-Host ""

# ブラウザでVRoid Studioページを開く
Write-Host "1. ブラウザでVRoid Studioのページを開きます..." -ForegroundColor Yellow
Start-Process $vroidUrl

Write-Host ""
Write-Host "📝 手順：" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. ブラウザが開いたら [無料でダウンロード] をクリック" -ForegroundColor White
Write-Host "2. Windows版を選択してダウンロード" -ForegroundColor White
Write-Host "3. ダウンロードしたインストーラーを実行" -ForegroundColor White
Write-Host "4. インストール完了後、VRoid Studioを起動" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "VRoid Studioでの作成手順" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎨 FF風キャラクター作成のコツ：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 髪型：" -ForegroundColor Green
Write-Host "   - プロシージャルヘア → スパイキー設定" -ForegroundColor White
Write-Host "   - 前髪を長めに、サイドを跳ねさせる" -ForegroundColor White
Write-Host ""
Write-Host "2. 瞳：" -ForegroundColor Green
Write-Host "   - 瞳のサイズを大きめに設定" -ForegroundColor White
Write-Host "   - 瞳孔を小さく、虹彩を大きく" -ForegroundColor White
Write-Host "   - ハイライトを強めに" -ForegroundColor White
Write-Host ""
Write-Host "3. 顔：" -ForegroundColor Green
Write-Host "   - 輪郭をシャープに" -ForegroundColor White
Write-Host "   - 顎を細めに調整" -ForegroundColor White
Write-Host ""
Write-Host "4. 服装：" -ForegroundColor Green
Write-Host "   - ダークカラーの衣装" -ForegroundColor White
Write-Host "   - レザーやメタル調のテクスチャ" -ForegroundColor White
Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "エクスポート設定" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "完成したら：" -ForegroundColor Yellow
Write-Host "1. ファイル → VRMエクスポート" -ForegroundColor White
Write-Host "2. 保存先：$env:USERPROFILE\Documents\VRoid\Exports\" -ForegroundColor White
Write-Host "3. ファイル名：character.vrm" -ForegroundColor White
Write-Host ""

# エクスポート用フォルダを作成
$exportPath = "$env:USERPROFILE\Documents\VRoid\Exports"
if (!(Test-Path $exportPath)) {
    New-Item -ItemType Directory -Path $exportPath -Force | Out-Null
    Write-Host "✅ エクスポート用フォルダを作成: $exportPath" -ForegroundColor Green
}

Write-Host ""
Write-Host "================================" -ForegroundColor Cyan
Write-Host "準備完了！" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Cyan