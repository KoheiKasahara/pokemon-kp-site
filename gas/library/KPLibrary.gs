/**
 * KP集計サイト共通のApps Scriptライブラリ。
 * スプレッドシートごとのスクリプトには公開用ラッパーだけを置き、
 * GitHubへの通知処理はこのライブラリで一元管理する。
 */
const KP_GITHUB_API_VERSION = '2022-11-28';
const KP_GITHUB_OWNER = 'KoheiKasahara';
const KP_GITHUB_REPOSITORY = 'pokemon-kp-site';
const KP_PUBLISH_EVENT_TYPE = 'spreadsheet_publish';

/** スプレッドシート側では `KPLibrary.publish()` として呼び出す。 */
function publish() {
  const ui = SpreadsheetApp.getUi();

  try {
    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token) {
      throw new Error('スクリプトプロパティ GITHUB_TOKEN が設定されていません。');
    }

    const response = UrlFetchApp.fetch(
      `https://api.github.com/repos/${KP_GITHUB_OWNER}/${KP_GITHUB_REPOSITORY}/dispatches`,
      {
        method: 'post',
        contentType: 'application/json',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': KP_GITHUB_API_VERSION,
        },
        payload: JSON.stringify({
          event_type: KP_PUBLISH_EVENT_TYPE,
          client_payload: {
            spreadsheetId: SpreadsheetApp.getActiveSpreadsheet().getId(),
            requestedAt: new Date().toISOString(),
          },
        }),
        muteHttpExceptions: true,
      },
    );

    const status = response.getResponseCode();
    if (status !== 204) {
      throw new Error(`GitHub Actions の起動に失敗しました (${status}): ${response.getContentText()}`);
    }

    ui.alert('サイト更新を受け付けました。数分後に公開内容が更新されます。');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(error);
    ui.alert(`サイト更新に失敗しました。\n${message}`);
    throw error;
  }
}
