const GITHUB_API_VERSION = '2022-11-28';
const GITHUB_OWNER = 'KoheiKasahara';
const GITHUB_REPOSITORY = 'pokemon-kp-site';
const PUBLISH_EVENT_TYPE = 'spreadsheet_publish';

/**
 * スプレッドシート上の画像・図形に割り当てる関数。
 * GitHub Actions の Deploy GitHub Pages を起動する。
 */
function publishSite() {
  const ui = SpreadsheetApp.getUi();

  try {
    const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
    if (!token) {
      throw new Error('スクリプトプロパティ GITHUB_TOKEN が設定されていません。');
    }

    const response = UrlFetchApp.fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPOSITORY}/dispatches`,
      {
        method: 'post',
        contentType: 'application/json',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': GITHUB_API_VERSION,
        },
        payload: JSON.stringify({
          event_type: PUBLISH_EVENT_TYPE,
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
