import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./shopStats.css";

const ShopStats = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["shopStats"],
    queryFn: () => apiRequest.get("/pins/stats/shop").then((res) => res.data),
  });

  if (isLoading) return <div className="statsLoading">Se încarcă datele...</div>;
  if (error) return <div className="statsError">Eroare: {error.response?.data?.message || error.message}</div>;

  const { totalPins = 0, totalViews = 0, totalClicks = 0, monetization } = data || {};

  return (
    <div className="shopStatsPage">
      <div className="statsHeader">
        <h1>📊 Statistici Magazin</h1>
        <p>Performanța conținutului tău și costurile de vizibilitate.</p>
      </div>

      <div className="statsGrid">
        
        <div className="statCard">
          <div className="iconContainer">📍</div>
          <div className="statInfo">
            <h3>Postări Active</h3>
            <span className="statNumber">{totalPins}</span>
          </div>
        </div>

        <div className="statCard">
          <div className="iconContainer">👁️</div>
          <div className="statInfo">
            <h3>Vizualizări Totale</h3>
            <span className="statNumber">{totalViews}</span>
            <small className="statSubtext">{monetization?.costPerView} RON / vizualizare</small>
          </div>
        </div>

        <div className="statCard highlight">
          <div className="iconContainer">🖱️</div>
          <div className="statInfo">
            <h3>Click-uri pe Link</h3>
            <span className="statNumber">{totalClicks}</span>
            <small className="statSubtext">{monetization?.costPerClick} RON / click</small>
          </div>
        </div>

      </div>

      <div className="billingSection">
        <h2>💰 Estimare Costuri (Vizibilitate)</h2>
        <div className="billCard">
          <div className="billRow">
            <span>Cost din Vizualizări ({totalViews} x {monetization?.costPerView})</span>
            <span>{(totalViews * monetization?.costPerView).toFixed(2)} RON</span>
          </div>
          <div className="billRow">
            <span>Cost din Click-uri ({totalClicks} x {monetization?.costPerClick})</span>
            <span>{(totalClicks * monetization?.costPerClick).toFixed(2)} RON</span>
          </div>
          <hr />
          <div className="billRow total">
            <span>Total de Plată</span>
            <span>{monetization?.totalCost} RON</span>
          </div>
          <button className="payBtn" onClick={() => alert("Integrare plată în curând!")}>
            Plătește Factura
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopStats;