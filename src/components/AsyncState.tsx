export function LoadingState() {
  return <p className="state-message">データを読み込み中…</p>;
}

export function ErrorState({ message }: { message: string }) {
  return <div className="state-message error"><strong>データを取得できませんでした。</strong><span>{message}</span></div>;
}
