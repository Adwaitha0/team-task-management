import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/login");
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <h2>TaskFlow</h2>
        <p className="role">{user?.role}</p>
        <nav>
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/workspaces">Workspaces</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          <NavLink to="/activities">Activity</NavLink>
        </nav>
        <button className="secondary" onClick={signOut}>Logout</button>
      </aside>
      <main className="main">
        <header>
          <div>
            <strong>{user?.name}</strong>
            <span>{user?.email}</span>
          </div>
        </header>
        <Outlet />
      </main>
    </div>
  );
}