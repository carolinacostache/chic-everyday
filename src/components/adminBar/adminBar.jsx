import { NavLink } from "react-router-dom";
import "./adminBar.css";

const AdminBar = () => {
  return (
    <nav className="adminBar">
      <div className="adminContainer">
        <span className="adminTitle">Panou Admin</span>
        <div className="adminLinks">
          <NavLink to="/admin/users" className={({ isActive }) => (isActive ? "active" : "")}>
            Useri
          </NavLink>
          <NavLink to="/admin/pins" className={({ isActive }) => (isActive ? "active" : "")}>
            Pinuri
          </NavLink>
          <NavLink to="/admin/tags" className={({ isActive }) => (isActive ? "active" : "")}>
            Taguri
          </NavLink>
          <NavLink to="/admin/boards" className={({ isActive }) => (isActive ? "active" : "")}>
            Boards
          </NavLink>
          <NavLink to="/admin/stats" className={({ isActive }) => (isActive ? "active" : "")}>
            Statistici
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default AdminBar;