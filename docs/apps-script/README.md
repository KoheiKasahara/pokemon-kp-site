# Apps Scriptの設定

1. `publish-site.gs` の内容を、対象スプレッドシートに紐づくApps Scriptへコピーする。
2. 必要に応じて `appsscript.json` の内容をマニフェストへ反映する。
3. スクリプトプロパティ `GITHUB_TOKEN` を設定する。
4. スプレッドシート上の画像または図形へ `publishSite` を割り当てる。
5. 初回のみApps Scriptの権限を承認する。

`publishSite` はGitHubの `repository_dispatch` APIへ `spreadsheet_publish` イベントを送り、GitHub Pagesのデプロイを開始する。
