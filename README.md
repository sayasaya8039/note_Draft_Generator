# note Draft Generator

選択したテキストから、noteの記事タイトル案と見出し構成案をAIで自動生成するChrome拡張機能です。

## 機能

- Webページ上で選択したテキストを右クリック → 「note記事案を作成」でAI生成
- タイトル案3つ、見出し構成案3パターンを自動生成
- 選択したタイトルと見出しから、記事執筆用のプロンプトを生成
- 生成したプロンプトをワンクリックでコピー

## 対応AI

以下の優先順位で利用可能なAIを自動選択します：

1. **Chrome AI**（Gemini Nano） - APIキー不要・無料
2. **Gemini API** - 無料枠あり（推奨）
3. **OpenAI API** - 有料

---

## インストール方法

### 1. 拡張機能ファイルのダウンロード

このリポジトリをダウンロードまたはクローンします。

```bash
git clone https://github.com/your-username/note-draft-generator.git
```

または、GitHubから「Code」→「Download ZIP」でダウンロードし、解凍してください。

### 2. Chromeに拡張機能をインストール

1. Chromeで `chrome://extensions` を開く
2. 右上の「**デベロッパーモード**」をオンにする
3. 「**パッケージ化されていない拡張機能を読み込む**」をクリック
4. ダウンロードしたフォルダ（`note-draft-generator`）を選択
5. 拡張機能一覧に「note Draft Generator」が表示されれば完了

---

## AIの設定

### Chrome AI（APIキー不要・完全無料）

Chrome 131以降では、ブラウザ内蔵のAI（Gemini Nano）を利用できます。APIキー不要で完全無料です。

#### 設定手順

1. **Chromeのバージョンを確認**
   - `chrome://version` を開いてバージョンが131以上であることを確認

2. **フラグを有効化**
   - `chrome://flags` を開く
   - 以下の項目を検索して「**Enabled**」に変更：
     - `#prompt-api-for-gemini-nano`
     - `#optimization-guide-on-device-model`

3. **Chromeを再起動**

4. **AIモデルをダウンロード**
   - `chrome://components` を開く
   - 「**Optimization Guide On Device Model**」を探す
   - 「**アップデートを確認**」をクリック
   - ステータスが「コンポーネントが更新されました」になるまで待つ
   - （モデルサイズが大きいため、ダウンロードに時間がかかる場合があります）

5. **確認**
   - 拡張機能の設定画面を開く
   - 「**Chrome AI 利用可能**」と表示されていればOK

> **注意**: Chrome AIが利用できない場合は、以下のGemini APIまたはOpenAI APIを設定してください。

---

### Gemini API（推奨・無料枠あり）

1. [Google AI Studio](https://aistudio.google.com/apikey) にアクセス
2. Googleアカウントでログイン
3. 「**Create API Key**」をクリック
4. 生成されたAPIキーをコピー
5. Chrome拡張機能の設定画面を開く
   - 拡張機能アイコンを右クリック →「オプション」
   - または `chrome://extensions` → note Draft Generator の「詳細」→「拡張機能のオプション」
6. 「Gemini APIキー」欄にペーストして「保存」

### OpenAI API（有料）

1. [OpenAI API Keys](https://platform.openai.com/api-keys) にアクセス
2. アカウント作成・ログイン
3. 「Create new secret key」でAPIキーを生成
4. [Billing](https://platform.openai.com/settings/organization/billing/overview) でクレジットを購入（最低$5〜）
5. 拡張機能の設定画面で「OpenAI APIキー」欄にペーストして「保存」

---

## 使い方

### Step 1: テキストを選択して右クリック

1. Webページ上で記事のネタにしたいテキストを選択（ドラッグ）
2. 右クリックでメニューを開く
3. 「**note記事案を作成**」をクリック

### Step 2: タイトルと見出しを選択

生成が完了すると、自動でポップアップウィンドウが開きます。

1. **タイトル案**（3つ）から1つをクリックして選択（緑色になります）
2. **見出し案**（3パターン）から1つをクリックして選択（青色になります）

### Step 3: プロンプトを生成

1. タイトルと見出しを両方選択すると「**プロンプトを生成**」ボタンが表示されます
2. ボタンをクリックすると、YAML形式の執筆プロンプトが生成されます
3. 「**プロンプトをコピー**」をクリックしてクリップボードにコピー

### Step 4: AIで記事を執筆

コピーしたプロンプトを、お好みの生成AIに貼り付けて記事を執筆してもらいます。

- ChatGPT
- Claude
- Gemini
- など

---

## 生成されるプロンプトの例

```yaml
task: note記事の執筆

article:
  title: "AIを活用した効率的なブログ執筆術"
  headings:
    - "なぜAIがブログ執筆に役立つのか"
    - "具体的なAI活用の3ステップ"
    - "注意点とコツ"

instructions:
  word_count: 各見出しごとに300〜500文字程度
  tone: 読者に語りかけるような親しみやすい文体
  content:
    - 具体例やエピソードを交えて分かりやすく説明する
    - 最後にまとめや読者へのメッセージを入れる
  format: note記事として読みやすい形式で出力
```

---

## トラブルシューティング

### 「APIキーが設定されていません」と表示される

- 設定画面でGeminiまたはOpenAIのAPIキーを入力してください
- 保存ボタンを押し忘れていないか確認してください

### 「Gemini API error: 429」と表示される

- 無料枠の利用制限に達しています
- しばらく待ってから再度お試しください

### 「OpenAI API error: 429」と表示される

- OpenAIのクレジットが不足しています
- [Billing](https://platform.openai.com/settings/organization/billing/overview) でクレジットを追加してください

### 右クリックメニューに「note記事案を作成」が表示されない

- テキストを選択してから右クリックしてください
- 拡張機能を一度削除して再インストールしてください

### ポップアップが開かない

- 拡張機能を再読み込みしてください
- `chrome://extensions` → 拡張機能の更新ボタンをクリック

---

## ファイル構成

```
note-draft-generator/
├── manifest.json     # 拡張機能の設定
├── background.js     # バックグラウンド処理（API呼び出し）
├── popup.html        # ポップアップUI
├── popup.js          # ポップアップのロジック
├── options.html      # 設定画面UI
├── options.js        # 設定画面のロジック
└── README.md         # このファイル
```

---

## ライセンス

MIT License

---

## 作者

Created with Claude Code
