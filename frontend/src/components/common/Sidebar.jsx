import { NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  const isAdmin = user.role === 'admin';
  const isManager = user.role === 'manager' || isAdmin;

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <ul className="nav-list">
          <li className="nav-item">
            <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-home"></i>
              <span>Dashboard</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/tickets" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-ticket-alt"></i>
              <span>Tickets</span>
            </NavLink>
          </li>
          
          <li className="nav-item">
            <NavLink to="/tickets/create" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-plus-circle"></i>
              <span>Create Ticket</span>
            </NavLink>
          </li>
          
          {isManager && (
            <li className="nav-item">
              <NavLink to="/users" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fas fa-users"></i>
                <span>Users</span>
              </NavLink>
            </li>
          )}
          
          {isAdmin && (
            <li className="nav-item">
              <NavLink to="/settings" className={({ isActive }) => isActive ? 'active' : ''}>
                <i className="fas fa-cog"></i>
                <span>Settings</span>
              </NavLink>
            </li>
          )}
          
          <li className="nav-item">
            <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
              <i className="fas fa-user"></i>
              <span>Profile</span>
            </NavLink>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;