# VRMモデルファイルについて

このディレクトリにVRM形式の3Dアバターモデルを配置してください。

## VRMとは
VRM（Virtual Reality Model）は、日本発の3Dアバター用ファイルフォーマットです。
VTuberやメタバースアプリケーションで広く使用されています。

## 必要なファイル
- `*.vrm` - VRMモデルファイル（GLB形式にメタデータを含む）
- デフォルトモデル: `default.vrm`

## 無料VRMモデルの入手先

### 1. VRoid Hub（公式）
- [VRoid Hub](https://hub.vroid.com/)
- 無料でダウンロード可能なモデル多数
- 利用条件を確認してください

### 2. BOOTH
- [BOOTH VRMカテゴリ](https://booth.pm/ja/items?tags%5B%5D=VRM)
- 無料・有料のモデル多数

### 3. VRoid Studio（自作）
- [VRoid Studio](https://vroid.com/studio)
- 無料の3Dキャラクター作成ソフト
- 簡単にオリジナルVRMモデルを作成可能

### 4. 推奨無料モデル
- **AliciaSolid**: [VRoid Hub](https://hub.vroid.com/characters/2792872861023597723/models/5013769147837660446)
- **Vita**: [VRoid Hub](https://hub.vroid.com/characters/6656256623185348312/models/1311652806498433728)
- **AvatarSample_A**: VRoid公式サンプル

## FF風高品質モデルの作成

### 方法1: VRoid Studioでカスタマイズ
1. VRoid Studioをダウンロード
2. FF風の特徴を再現：
   - スパイキーな髪型
   - 大きな瞳
   - シャープな顔立ち
   - 複雑な服装デザイン
3. テクスチャをカスタマイズ
4. VRM形式でエクスポート

### 方法2: Blenderで本格制作
1. Blenderで3Dモデル作成
2. [VRM Add-on for Blender](https://github.com/saturday06/VRM-Addon-for-Blender)を使用
3. FF風のデザインを忠実に再現
4. VRM形式でエクスポート

### 方法3: プロに依頼
- 費用: 5万円〜30万円
- 制作期間: 2週間〜1ヶ月
- FF風の高品質モデル制作

## セットアップ手順

1. VRMファイルをこのディレクトリに配置
2. ファイル名を`default.vrm`にリネーム（デフォルトモデルの場合）
3. またはキャラクター設定でカスタムURLを指定

## 技術仕様

### 推奨スペック
- ポリゴン数: 10,000〜50,000
- テクスチャ: 2048x2048以下
- ボーン構造: VRM標準準拠
- ブレンドシェイプ: 
  - 表情（happy, sad, angry, surprised）
  - 口パク（aa, ih, ou, ee, oh）
  - まばたき（blink, blink_l, blink_r）

### パフォーマンス最適化
- モバイル対応: ポリゴン数10,000以下推奨
- デスクトップ: ポリゴン数50,000まで対応
- テクスチャアトラス使用推奨

## ライセンス注意事項
- 各モデルの利用規約を必ず確認
- 商用利用の可否を確認
- クレジット表記の必要性を確認
- 改変の可否を確認

## トラブルシューティング

### モデルが表示されない
- ファイル名とパスを確認
- CORSエラーの場合はサーバー設定を確認
- コンソールログでエラー詳細を確認

### 表情が動かない
- ブレンドシェイプの名前を確認
- VRM標準の表情名を使用しているか確認

### パフォーマンスが悪い
- ポリゴン数を削減
- テクスチャサイズを縮小
- LOD（Level of Detail）を実装