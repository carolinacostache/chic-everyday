import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { Link } from "react-router-dom";
import "./adminStats.css"; // Creăm CSS-ul la pasul următor

const AdminStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminStats"],
    queryFn: () => apiRequest.get("/admin/stats").then((res) => res.data),
  });

  if (isLoading) return <div>Se încarcă...</div>;
  if (error) return <div>Eroare la încărcare.</div>;

  const { revenue, shopsLeaderboard } = data;

  return (
    <div className="adminStatsPage">
      {/* Buton de întoarcere la Dashboard */}
      <Link to="/admin" className="backLink">← Înapoi la Dashboard</Link>

      <div className="headerSection">
        <h1>💰 Raport Financiar & Gamification</h1>
        <p>Performanța magazinelor și veniturile generate.</p>
      </div>

      <div className="revenueCard">
        <h3>Venit Total Estimat</h3>
        <div className="bigMoney">{revenue} RON</div>
        <p>Din vizualizări (0.01 RON) și click-uri (0.50 RON)</p>
      </div>

      <div className="leaderboardSection">
        <h2>🏆 Top Parteneri</h2>
        <table className="gamificationTable">
          <thead>
            <tr>
              <th>#</th>
              <th>Magazin</th>
              <th>Nivel (Tier)</th>
              <th>Vizualizări / Clickuri</th>
              <th>De Plată</th>
            </tr>
          </thead>
          <tbody>
            {shopsLeaderboard.map((shop, index) => (
              <tr key={shop._id}>
                <td><strong>#{index + 1}</strong></td>
                <td>
                  <div className="shopInfo">
                    <img src={shop.logo || "/general/noAvatar.jpg"} alt="" />
                    <span>{shop.shopName || shop.username}</span>
                  </div>
                </td>
                <td>
                  <span className={`tierBadge ${shop.tier.includes("Diamond") ? "diamond" : shop.tier.includes("Gold") ? "gold" : "bronze"}`}>
                    {shop.tier}
                  </span>
                </td>
                <td>
                   👁️ {shop.totalViews} | 🖱️ {shop.totalClicks}
                </td>
                <td className="billCell">{shop.estimatedBill} RON</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminStats;