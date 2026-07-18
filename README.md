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

`.github/workflows/deploy-pages.yml` を含めてGitHubの `main` ブランチへpushする。リポジトリの **Settings → Pages** で公開元に **GitHub Actions** を選択すると、以後は `main` へのpushごとに自動公開される。

## ポケモン画像

- ポケモン一覧: `public/data/pokemon.json`
- 画像: `public/images/pokemon/`

JSONの `name` はスプレッドシートに入力するポケモン名と完全に一致させる。画像が未配置・取得失敗の場合は、名前の頭文字を表示する。
