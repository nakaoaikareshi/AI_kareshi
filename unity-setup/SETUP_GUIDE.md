# 🎮 Unity VRMキャラクター作成 セットアップガイド

## ✅ 準備完了！
Unity Hubのインストーラーをダウンロードしました。
以下の手順で進めてください。

## 📝 手動セットアップ手順

### 1. Unity Hubのインストール（2分）

1. ファイルエクスプローラーを開く
2. 以下のフォルダに移動：
   ```
   C:\Users\m_fun\nakao_no_kareshi\nakao-ai-boyfriend\unity-setup
   ```
3. **UnityHubSetup.exe** をダブルクリック
4. インストーラーの指示に従ってインストール
5. インストール完了後、Unity Hubが自動で起動します

### 2. Unityアカウントの作成/ログイン（3分）

Unity Hubが起動したら：
1. **Sign in** をクリック
2. Unityアカウントでログイン（なければ作成）
   - メールアドレス
   - パスワード

### 3. Unity 2022.3 LTSのインストール（10-15分）

1. Unity Hub左側の **Installs** タブをクリック
2. **Install Editor** ボタンをクリック
3. **Unity 2022.3.XX LTS** を選択（推奨版）
4. モジュール選択画面で以下を確認：
   - ✅ Windows Build Support (IL2CPP)
   - ✅ Visual Studio（開発環境）
5. **Install** をクリック
6. ダウンロード完了まで待機（約10-15分）

### 4. VRMプロジェクトの作成（2分）

1. Unity Hub左側の **Projects** タブをクリック
2. **New project** ボタンをクリック
3. 設定：
   - Template: **3D Core**
   - Project name: **VRMCharacterCreator**
   - Location: デフォルトのまま
4. **Create project** をクリック
5. Unityエディタが起動するまで待機（初回は3-5分）

### 5. VRM環境のセットアップ（1分）

Unityプロジェクトが開いたら：

1. PowerShellを開く
2. 以下のコマンドを実行：
   ```powershell
   cd C:\Users\m_fun\nakao_no_kareshi\nakao-ai-boyfriend\unity-setup
   .\setup-vrm-project.ps1
   ```

### 6. キャラクター作成ツールの導入（2分）

1. Unityエディタに戻る
2. **Project** ウィンドウで右クリック
3. **Import New Asset** を選択
4. 以下のファイルを選択：
   ```
   C:\Users\m_fun\nakao_no_kareshi\nakao-ai-boyfriend\unity-setup\CharacterCreator.cs
   ```
5. **Import** をクリック
6. スクリプトのコンパイルが完了するまで待機（10-30秒）

### 7. キャラクターを作成！

1. Unityメニューバーの **Tools** → **VRM Character Creator** を選択
2. 設定パネルが開きます：
   - 性別を選択
   - 髪型を選択（Spiky = クラウド風）
   - 服装を選択（Fantasy = FF風）
   - 瞳のサイズを調整（1.3推奨）
3. **キャラクターを作成** ボタンをクリック
4. **VRMとしてエクスポート** ボタンをクリック
5. ファイル名を **character.vrm** として保存

### 8. Webアプリで使用

1. 保存したVRMファイルをコピー：
   ```
   元: Unity Projects\VRMCharacterCreator\Assets\VRM_Exports\character.vrm
   先: C:\Users\m_fun\nakao_no_kareshi\nakao-ai-boyfriend\public\models\vrm\default.vrm
   ```
2. ブラウザでWebアプリを更新
3. 3Dキャラクターが表示されます！

---

## 🚀 クイックチェックリスト

- [ ] Unity Hubインストール完了
- [ ] Unityアカウントでログイン
- [ ] Unity 2022.3 LTSインストール完了
- [ ] VRMCharacterCreatorプロジェクト作成
- [ ] VRM環境セットアップ完了
- [ ] CharacterCreator.cs導入完了
- [ ] Tools → VRM Character Creatorが表示される
- [ ] キャラクター作成＆エクスポート成功
- [ ] Webアプリで3Dキャラクター表示

## ⚠️ トラブルシューティング

### Unity Hubが起動しない
- Windows Defenderの警告が出たら「詳細情報」→「実行」
- 管理者権限で実行してみる

### VRM Character Creatorメニューが出ない
1. Consoleウィンドウ（Window → General → Console）でエラー確認
2. CharacterCreator.csが正しくインポートされているか確認
3. スクリプトのコンパイルエラーがないか確認

### VRMエクスポートできない
- UniVRMパッケージがインストールされているか確認
- setup-vrm-project.ps1を再実行

## 💡 サポート

問題が解決しない場合は、以下の情報と一緒にお知らせください：
- Unity Hubのバージョン
- Unityのバージョン  
- エラーメッセージ（Consoleウィンドウの内容）

---

準備ができたら、FF風の美麗3Dキャラクターを作成しましょう！