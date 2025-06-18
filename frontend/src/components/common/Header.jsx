import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <Link to="/dashboard" className="logo">
            🎫 Tick'Help
          </Link>
        </div>
        <div className="header-right">
          {user && (
            <div className="user-menu">
              <button className="user-menu-button" onClick={toggleMenu}>
                <div className="user-avatar">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={`${user.firstName} ${user.lastName}`} />
                  ) : (
                    <div className="avatar-placeholder">
                      {user.firstName?.[0]}
                      {user.lastName?.[0]}
                    </div>
                  )}
                </div>
                <span className="user-name">{user.firstName} {user.lastName}</span>
                <span className="arrow-down">▼</span>
              </button>
              
              {isMenuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="menu-item">
                    <i className="fas fa-user"></i> Profile
                  </Link>
                  {(user.role === 'admin' || user.role === 'manager') && (
                    <Link to="/users" className="menu-item">
                      <i className="fas fa-users"></i> Users
                    </Link>
                  )}
                  <button onClick={handleLogout} className="menu-item logout-button">
                    <i className="fas fa-sign-out-alt"></i> Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;