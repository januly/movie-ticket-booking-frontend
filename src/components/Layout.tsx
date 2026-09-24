import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function Layout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" to="/movies">
          <span className="brand-box">MT</span>
          <span><strong>Movie Tickets</strong><small>Movie ticket booking</small></span>
        </Link>
        <nav className="nav-list" aria-label="Main navigation">
          <NavLink to="/movies">Movies</NavLink>
        </nav>
        <div className="user-box">
          <strong>{session?.user.name}</strong>
          <span>{session?.user.role === 'ADMIN' ? 'Administrator' : 'Customer'}</span>
          <button className="btn btn-outline-primary" onClick={handleLogout}>Sign out</button>
        </div>
      </aside>
      <main className="main-panel"><Outlet /></main>
    </div>
  );
}
