import { NavLink, Route, Routes } from 'react-router-dom';
import { TournamentDetailPage } from './pages/TournamentDetailPage';
import { TournamentListPage } from './pages/TournamentListPage';
import { UserSearchPage } from './pages/UserSearchPage';

export function App() {
  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          <span className="brand-mark">KP</span>
          <span>ポケモンKP集計</span>
        </NavLink>
        <nav aria-label="メインメニュー">
          <NavLink to="/" end>大会一覧</NavLink>
          <NavLink to="/users">ユーザー検索</NavLink>
        </nav>
      </header>

      <main className="content">
        <Routes>
          <Route path="/" element={<TournamentListPage />} />
          <Route path="/tournaments/:tournamentId" element={<TournamentDetailPage />} />
          <Route path="/users" element={<UserSearchPage />} />
          <Route path="*" element={<TournamentListPage />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <p>ポケットモンスター エメラルド（第3世代）大会の非営利KP集計サイト</p>
      </footer>
    </div>
  );
}
