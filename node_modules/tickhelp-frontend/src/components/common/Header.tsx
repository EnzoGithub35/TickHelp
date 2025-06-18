import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";

const Header = () => {
  const { user, logout } = useAuth();

  return (
    <header className="header">
      <Link to="/" className="logo">
        Tick'Help
      </Link>
      <nav>
        <span className="user-info">
          {user && (
            <>
              <span>
                {user.firstName} {user.lastName} ({user.role})
              </span>
              <button onClick={logout} className="logout-btn">
                Logout
              </button>
            </>
          )}
        </span>
      </nav>
    </header>
  );
};

export default Header;
