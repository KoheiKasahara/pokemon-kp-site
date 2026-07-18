# Apps Scriptの設定

## 共通ライブラリを作る（初回のみ）

1. [Apps Script](https://script.google.com/home) で**スタンドアロン**プロジェクトを新規作成する。
2. `gas/library/KPLibrary.gs` と `gas/library/appsscript.json` の内容をコピーする。
3. **デプロイ → デプロイを管理 → バージョンを追加**でバージョンを作成する。
4. **プロジェクトの設定**からスクリプトIDを控える。

ライブラリのコードを直すときは、ここだけを修正して新しいバージョンを作成する。各スプレッドシートへ同じコードを貼り直す必要はない。

## 各スプレッドシートへ追加する

1. 対象スプレッドシートの **拡張機能 → Apps Script** を開く。
2. **ライブラリ**の「＋」から、共通ライブラリのスクリプトIDを追加する。識別子は **`KPLibrary`**、バージョンは作成した番号を選ぶ。
3. `publish-site.gs` の内容をコピーする。
4. 必要に応じて `appsscript.json` の内容をマニフェストへ反映する。
5. スクリプトプロパティ `GITHUB_TOKEN` を設定する。
6. スプレッドシート上の画像または図形へ `publishSite` を割り当てる。
7. 初回のみApps Scriptの権限を承認する。

各シートに残るコードは次だけです。

```javascript
function publishSite() {
  KPLibrary.publish();
}
```

`publishSite` はGitHubの `repository_dispatch` APIへ `spreadsheet_publish` イベントを送り、GitHub Pagesのデプロイを開始する。
