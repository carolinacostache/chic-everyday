import { NavLink, Link, useSearchParams, useLocation } from "react-router-dom";
import "./adminBar.css";

const AdminBar = () => {

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  /* in cazul in care o sa mai fie adaugate pagini pe viitor unde o sa implementam cautare*/
  const showSearch = ["/admin/users", "/admin/pins", "/admin/boards"].includes(location.pathname);

  const handleSearch = (e) => {
    const text = e.target.value;
    if (text) {
      setSearchParams({ search: text });
    } else {
      setSearchParams({});
    }
  };
  return (
    <nav className="adminBar">
      <div className="adminContainer">
        <Link to="/admin" className="adminTitle">
        <h1>Panou Admin</h1>
        </Link>
        {showSearch && (
          <div className="adminSearchContainer">
            <input
              type="text"
              placeholder="Caută..."
              value={searchParams.get("search") || ""}
              onChange={handleSearch}
              className="adminNavSearch"
            />
          </div>
        )}
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