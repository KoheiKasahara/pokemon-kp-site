# ポケモンKP集計サイト

Google Apps Script APIと接続する、GitHub Pages向けのReact + TypeScript静的サイト。

## 開発

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```

`dist` をGitHub Pagesへ公開する。ルーティングにはHashRouterを使っているため、GitHub Pagesの直接アクセスでも404にならない。

## GitHub Pagesへの公開

`.github/workflows/deploy-pages.yml` を含めてGitHubの `main` ブランチへpushする。リポジトリの **Settings → Pages** で公開元に **GitHub Actions** を選択すると、以後は次の操作で公開される。

- `main` ブランチへのpush
- GitHub Actions画面からの手動実行
- スプレッドシートの「サイト更新」ボタン

## スプレッドシートからサイトを更新する

`docs/apps-script/publish-site.gs` を、対象スプレッドシートに紐づくApps Scriptプロジェクトへコピーする。

### 1. GitHubトークンを作成する

Fine-grained personal access tokenを作成し、対象リポジトリを `pokemon-kp-site` のみに限定する。Repository permissionsの **Contents** を **Read and write** に設定する。

### 2. Apps Scriptへトークンを保存する

Apps Scriptの **プロジェクトの設定 → スクリプト プロパティ** に次を登録する。

| プロパティ | 値 |
| --- | --- |
| `GITHUB_TOKEN` | 作成したGitHubトークン |

トークンはスプレッドシートのセルやソースコードへ直接記載しない。

### 3. 更新ボタンを配置する

スプレッドシートで **挿入 → 図形描画** または **挿入 → 画像** からボタンを配置し、メニューから **スクリプトを割り当て** を選択する。関数名には次を入力する。

```text
publishSite
```

初回実行時はGoogleの権限確認が表示される。許可後、ボタンを押すと `repository_dispatch` によりGitHub Pagesのデプロイが開始される。

## ポケモン画像

- ポケモン一覧: `public/data/pokemon.json`
- エメラルド画像: `public/image/emerald/`（全国図鑑番号の PNG）

JSONの `name` はスプレッドシートに入力するポケモン名と完全に一致させる。画像が未配置・取得失敗の場合は、名前の頭文字を表示する。
