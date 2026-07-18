# GAS API セットアップ

このコードは、スプレッドシートの次の3シートだけを読み取る公開用の読み取りAPIです。

- `公開_大会`
- `公開_参加者`
- `公開_ポケモン集計`

`管理_ポケモンマスタ`やGoogleフォームの回答シートはAPIから返しません。

## 1. Apps Scriptへ貼り付ける

1. アップロードしたGoogleスプレッドシートを開く。
2. **拡張機能 → Apps Script** を開く。
3. 既存の `Code.gs` の内容を消し、このフォルダの `Code.gs` を貼り付ける。
4. `SPREADSHEET_ID` を、対象スプレッドシートURLの `/d/` と `/edit` の間にある文字列へ置き換える。
5. 保存する。

例: `https://docs.google.com/spreadsheets/d/abc123DEF456/edit` の場合、IDは `abc123DEF456`。

## 2. 動作確認

Apps Scriptの関数一覧から `testGetTournaments` を選んで実行する。初回はGoogleへの権限付与が必要。実行ログに大会一覧のJSONが表示されたら、シート名・列名・IDの設定は正しい。

## 3. ウェブアプリとして公開

1. **デプロイ → 新しいデプロイ** を選ぶ。
2. 種類に **ウェブアプリ** を選ぶ。
3. 実行ユーザーは **自分**、アクセスできるユーザーはサイトの公開方針に合わせて **全員** を選ぶ。
4. デプロイして表示された `/exec` URL を控える。

公開サイトにはテスト用の `/dev` URLではなく、デプロイ後の `/exec` URLを設定する。

## API

| URL例 | 内容 |
| --- | --- |
| `{API_URL}?resource=tournaments` | 公開中の大会一覧 |
| `{API_URL}?resource=tournament&id=emerald-sample-a` | 大会詳細、KP、参加者パーティ |
| `{API_URL}?resource=users&q=アオイ` | 表示名の部分一致検索 |

### 大会詳細の戻り値の要点

```json
{
  "ok": true,
  "data": {
    "tournament": {
      "participant_count": 8,
      "valid_entry_count": 6
    },
    "pokemon_stats": [
      { "pokemon_name": "メタグロス", "usage_rate": 0.8333333333, "kp": 5 }
    ],
    "entries": [
      { "user_name": "アオイ", "pokemon": ["ボーマンダ"], "party_kp": 22 }
    ]
  }
}
```

- `participant_count`: 棄権者・パーティ不明者を含む大会参加人数
- `valid_entry_count`: KP・使用率の集計対象となる、有効パーティの提出者数
- `party_kp`: 参加者が採用した6匹のKP合計

## 公開前チェック

- `公開_大会` の `published` が `TRUE` の大会だけ返る。
- `公開_参加者` は行順を保持して返るため、管理者が整えた行順が順位なし大会の投稿順になる。
- ポケモン名の表記は、手元のポケモンJSONの表示名と完全に一致させる。
- Apps ScriptのWebアプリはレスポンスヘッダーを自由に設定できない。GitHub Pagesから実際に `fetch` して、CORSを必ず確認する。
