import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import apiRequest from "../../utils/apiRequest";
import "./shopStats.css";

const ShopStats = () => {
  const [showDetails, setShowDetails] = useState(false);

  const { data, isLoading, error } = useQuery({
    queryKey: ["shopStats"],
    queryFn: () => apiRequest.get("/pins/stats/shop").then((res) => res.data),
  });

  if (isLoading) return <div className="statsLoading">Se încarcă datele...</div>;
  if (error) return <div className="statsError">Eroare: {error.response?.data?.message || error.message}</div>;

  const { totalPins = 0, totalViews = 0, totalClicks = 0, totalComments= 0, monetization, pins=[] } = data || {};

  return (
    <div className="shopStatsPage">
      <div className="statsHeader">
        <h1>📊 Statistici Magazin</h1>
        <p>Performanța conținutului tău și costurile de vizibilitate.</p>
      </div>

      <div className="statsGrid">
        
        <div 
          className={`statCard clickable ${showDetails ? 'active' : ''}`} 
          onClick={() => setShowDetails(!showDetails)}
          title="Apasă pentru detalii per postare">
          <div className="iconContainer">📍</div>
          <div className="statInfo">
            <h3>Postări Active</h3>
            <span className="statNumber">{totalPins}</span>
            <small className="clickHint">{showDetails ? "Ascunde Detalii 🔼" : "Vezi Detalii 🔽"}</small>
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

        <div className="statCard">
          <div className="iconContainer">💬</div>
          <div className="statInfo">
            <h3>Comentarii</h3>
            <span className="statNumber">{totalComments}</span>
            <small className="statSubtext">Interacțiuni</small>
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

      {showDetails && (
        <div className="detailsSection">
          <h2>Detaliere pe Postări</h2>
          <div className="tableWrapper">
            <table className="statsTable">
              <thead>
                <tr>
                  <th>Imagine</th>
                  <th>Titlu Postare</th>
                  <th>👁️ Vizualizări</th>
                  <th>🖱️ Click-uri</th>
                  <th>❤️ Aprecieri</th>
                  <th>💬 Comentarii</th>
                </tr>
              </thead>
              <tbody>
                {pins.map((pin) => (
                  <tr key={pin._id}>
                    <td>
                      <img src={pin.img} alt="" className="tableImg" />
                    </td>
                    <td className="tableTitle">{pin.title || "Fără titlu"}</td>
                    <td>{pin.views || 0}</td>
                    <td><strong>{pin.linkClicks || pin.clicks || 0}</strong></td>
                    <td>{pin.likes ? pin.likes.length : 0}</td>
                    <td>{pin.commentCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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