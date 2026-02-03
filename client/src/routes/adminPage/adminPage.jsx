import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { Link } from "react-router-dom";
import "./adminPage.css";

const AdminPage = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiRequest.get("/admin/stats").then((res) => res.data),
  });

  if (isLoading) return <div className="adminLoading">Se încarcă datele...</div>;
  if (error) return <div className="adminError">Eroare la încărcare.</div>;

  const { counts, latestUsers } = data;

  return (
    <div className="adminPage dashboardPage">
      <div className="dashboardHeader">
        <h1>👋 Bun venit, Admin!</h1>
        <p>Panoul principal de administrare ChicEveryday.</p>
      </div>

      <div className="statsGrid">
        <Link to="/admin/requests" className="statCard pending">
          <div className="statInfo">
            <h3>Cereri Magazine</h3>
            <span className="statNumber">{counts.pendingShops}</span>
          </div>
        </Link>
        <Link to="/admin/stats" className="statCard money">
          <div className="statInfo">
            <h3>Monetizare & Top</h3>
            {/* Putem pune un icon sau text "Vezi detalii" */}
            <span className="statLabel">Vezi Raport ➔</span>
          </div>
        </Link>
        <Link to="/admin/users" className="statCard">
          <div className="statInfo">
            <h3>Utilizatori</h3>
            <span className="statNumber">{counts.users}</span>
          </div>
        </Link>
        <Link to="/admin/pins" className="statCard">
          <div className="statInfo">
            <h3>Pin-uri</h3>
            <span className="statNumber">{counts.pins}</span>
          </div>
        </Link>
        <Link to="/admin/boards" className="statCard">
          <div className="statInfo">
            <h3>Board-uri</h3>
            <span className="statNumber">{counts.boards}</span>
          </div>
        </Link>
      </div>

      <div className="recentSection">
        <h2>Cei mai noi utilizatori</h2>
        <div className="recentTableContainer">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Dată</th>
                <th>Rol</th>
              </tr>
            </thead>
            <tbody>
              {latestUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString("ro-RO")}</td>
                  <td>{user.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;