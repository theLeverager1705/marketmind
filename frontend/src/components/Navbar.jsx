import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <header className="navbar">
      <Link to="/" className="brand">
        <span className="logo">◆</span> MarketMind
      </Link>
      <nav>
        {user ? (
          <>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/account">Account</NavLink>
            <span className="avatar" title={user.email}>{user.name[0]?.toUpperCase()}</span>
            <button className="btn ghost sm" onClick={async () => { await logout(); nav('/'); }}>
              Sign out
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">Sign in</NavLink>
            <Link to="/register" className="btn sm">Get started</Link>
          </>
        )}
      </nav>
    </header>
  );
}
