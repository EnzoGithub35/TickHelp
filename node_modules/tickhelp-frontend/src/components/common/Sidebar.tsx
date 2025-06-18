import { NavLink } from "react-router-dom";

const Sidebar = () => (
  <aside className="sidebar">
    <nav>
      <ul>
        <li>
          <NavLink to="/">Accueil</NavLink>
        </li>
        <li>
          <NavLink to="/tickets">Tickets</NavLink>
        </li>
        <li>
          <NavLink to="/users">Utilisateurs</NavLink>
        </li>
      </ul>
    </nav>
  </aside>
);

export default Sidebar;
