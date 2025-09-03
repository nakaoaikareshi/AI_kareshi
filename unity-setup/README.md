# Unity VRMキャラクター作成ガイド

## 🎮 セットアップ手順

### 1. Unity Hubのインストール（約5分）

PowerShellを**管理者権限**で開いて実行：

```powershell
cd nakao-ai-boyfriend\unity-setup
.\install-unity.ps1
```

### 2. Unityプロジェクトの作成（約10分）

Unity Hubが開いたら：
1. Unityアカウントでログイン
2. **Installs**タブ → **Install Editor** → **Unity 2022.3 LTS**を選択
3. **Projects**タブ → **New project**
4. テンプレート: **3D Core**
5. プロジェクト名: **VRMCharacterCreator**
6. **Create project**

### 3. VRM環境のセットアップ（約3分）

PowerShellで実行：

```powershell
.\setup-vrm-project.ps1
```

これで以下が自動設定されます：
- UniVRM（VRMサポート）のインストール
- プロジェクト構造の作成
- キャラクター作成ツールの準備

### 4. キャラクター作成ツールの設定

1. Unityエディタを開く
2. `CharacterCreator.cs`を以下の場所にコピー：
   ```
   Unity Projects\VRMCharacterCreator\Assets\Scripts\Character\
   ```
3. Unityに戻ってスクリプトが認識されるまで待つ
4. メニューバーに **Tools → VRM Character Creator** が表示される

## 🎨 キャラクター作成

### Unity内でのキャラクター作成

1. **Tools → VRM Character Creator** を開く
2. キャラクター設定：
   - **性別**: 男性/女性
   - **髪型**: 
     - Spiky（クラウド風）
     - Ponytail（ティファ風）
     - TwinTails（エアリス風）
     - Wild（スコール風）
   - **服装スタイル**:
     - Fantasy（FF風ファンタジー）
     - Military（FF7/8風）
     - Knight（騎士風）
     - Magical（魔法使い風）
   - **瞳のサイズ**: 1.2〜1.5（FF風の大きな瞳）
3. **「キャラクターを作成」**ボタンをクリック
4. **「VRMとしてエクスポート」**ボタンでVRMファイルを出力

### 作成したVRMをWebアプリで使用

1. エクスポートしたVRMファイルを以下にコピー：
   ```
   nakao-ai-boyfriend\public\models\vrm\default.vrm
   ```
2. ブラウザをリフレッシュ

## 🛠️ 高度なカスタマイズ

### Blenderとの連携

より詳細なモデリングが必要な場合：

1. **Blender**をインストール（無料）
2. **VRM Add-on for Blender**をインストール
3. Unityで作成した基本モデルをFBXエクスポート
4. Blenderで詳細なモデリング
5. VRM形式で再エクスポート

### VRoid Studioとの連携

アニメ風キャラクターの場合：

1. **VRoid Studio**（無料）をダウンロード
2. キャラクターを作成
3. VRM形式でエクスポート
4. UnityでインポートしてFF風にカスタマイズ

## 📚 リソース

### 無料アセット

- **Unity Asset Store**
  - 無料の髪型パック
  - 服装アセット
  - アクセサリー

### テクスチャ

- **Textures.com**: 高品質テクスチャ
- **Substance Painter**: プロ向けテクスチャ作成

### アニメーション

- **Mixamo**: 無料モーションライブラリ
- Unity内でアニメーション作成

## 🎯 FF風キャラクターのポイント

### デザイン要素
- ✨ **大きく印象的な瞳**
- 🦱 **特徴的な髪型**（スパイキー、重力無視）
- 👗 **複雑で装飾的な服装**
- ⚔️ **ファンタジー要素**（ベルト、ジッパー、アクセサリー）
- 🎨 **鮮やかな配色**

### 推奨設定
```
瞳のサイズ: 1.3〜1.5
頭のサイズ: 0.9〜1.0
髪色: 鮮やか（金、銀、赤、青など）
服装: Fantasy または Military
```

## ⚡ クイックスタート

最速でキャラクターを作成：

```powershell
# 1. Unity Hubインストール
.\install-unity.ps1

# 2. プロジェクト作成後
.\setup-vrm-project.ps1

# 3. Unity内でTools → VRM Character Creator
# 4. 設定して「キャラクターを作成」→「VRMとしてエクスポート」
```

## 🔧 トラブルシューティング

### Unity Hubが起動しない
- Windows Defenderの例外にUnity Hub.exeを追加
- 管理者権限で実行

### UniVRMがインポートできない
- Unity 2022.3 LTSを使用しているか確認
- Package Managerでエラーを確認

### VRMエクスポートができない
- UniVRMが正しくインストールされているか確認
- Consoleウィンドウでエラーを確認

## 💡 Tips

- **プリセット保存**: お気に入りの設定をScriptableObjectとして保存
- **バッチ処理**: 複数キャラクターを一括作成
- **アニメーション**: Animatorコントローラーで表情や動きを制御

---

準備ができたら、FF風の美麗3Dキャラクターを作成しましょう！