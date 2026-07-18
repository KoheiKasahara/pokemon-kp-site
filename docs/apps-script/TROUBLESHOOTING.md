# トラブルシューティング

- `GITHUB_TOKEN` 未設定: Apps Scriptのスクリプトプロパティを確認する。
- HTTP 401/403: GitHubトークンの有効期限、対象リポジトリ、Contents権限を確認する。
- HTTP 404: `GITHUB_OWNER` と `GITHUB_REPOSITORY` を確認する。
- Actionsが開始されない: `deploy-pages.yml` の `repository_dispatch` とイベント名 `spreadsheet_publish` を確認する。
