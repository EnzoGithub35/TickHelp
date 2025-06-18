import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Layout.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-left">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? "❮" : "❯"}
          </button>
          <h1 className="app-title">Tick'Help</h1>
        </div>
        {user && (
          <div className="header-right">
            <div className="user-info">
              <span className="user-name">{`${user.firstName} ${user.lastName}`}</span>
              <span className="user-role">{user.role}</span>
            </div>
            <div className="user-avatar">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="User avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
              )}
            </div>
            <button className="logout-button" onClick={handleLogout}>
              Log out
            </button>
          </div>
        )}
      </header>

      <div className="app-body">
        {user && (
          <aside className={`app-sidebar ${sidebarOpen ? "open" : "closed"}`}>
            <nav className="sidebar-nav">
              <ul>
                <li>
                  <a href="/dashboard">
                    <i className="icon">📊</i>
                    <span className="nav-text">Dashboard</span>
                  </a>
                </li>
                <li>
                  <a href="/tickets">
                    <i className="icon">🎟️</i>
                    <span className="nav-text">Tickets</span>
                  </a>
                </li>
                <li>
                  <a href="/tickets/new">
                    <i className="icon">➕</i>
                    <span className="nav-text">New Ticket</span>
                  </a>
                </li>
                {(user.role === "admin" || user.role === "manager") && (
                  <li>
                    <a href="/users">
                      <i className="icon">👥</i>
                      <span className="nav-text">Users</span>
                    </a>
                  </li>
                )}
                <li>
                  <a href="/profile">
                    <i className="icon">👤</i>
                    <span className="nav-text">Profile</span>
                  </a>
                </li>
              </ul>
            </nav>
          </aside>
        )}

        <main
          className={`app-content ${user && sidebarOpen ? "with-sidebar" : ""}`}
        >
          {children}
        </main>
      </div>

      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} Tick'Help - DEVE427 Project</p>
      </footer>
    </div>
  );
};

export default Layout;
