# Live2Dモデルファイルについて

このディレクトリにLive2Dモデルファイルを配置してください。

## 必要なファイル
- `*.model3.json` - モデル定義ファイル
- `*.moc3` - モデルデータ
- `*.physics3.json` - 物理演算設定
- `*.cdi3.json` - 表示設定
- テクスチャファイル（PNGなど）

## 無料モデルの入手先

### 1. Live2D公式サンプル
- [Live2D Cubism SDK](https://www.live2d.com/download/cubism-sdk/)
- サンプルモデル「Hiyori」「Mark」など

### 2. nizima (Live2D公式マーケット)
- [nizima](https://nizima.com/)
- 無料配布モデルあり

### 3. FF風高品質モデルの作成
- プロのイラストレーター依頼（推奨）
- Live2D Cubismでのモデリング作業が必要

## セットアップ手順

1. Live2Dモデルファイルをこのディレクトリに配置
2. `src/components/avatar/Live2DAvatar.tsx`のmodelUrlを更新
3. 必要に応じて表情IDをカスタマイズ

## ライセンス注意事項
- 使用するモデルのライセンスを必ず確認してください
- 商用利用の場合は適切なライセンスを取得してください