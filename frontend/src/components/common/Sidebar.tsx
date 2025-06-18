import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li>
          <NavLink to="/dashboard">Dashboard</NavLink>
        </li>
        <li>
          <NavLink to="/tickets">Tickets</NavLink>
        </li>
        <li>
          <NavLink to="/users">Users</NavLink>
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
