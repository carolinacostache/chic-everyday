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

  // Extragem datele cu valori default
  const { totalPins = 0, totalViews = 0, totalClicks = 0, totalComments= 0, monetization, pins=[] } = data || {};

  return (
    <div className="shopStatsPage">
      <div className="statsHeader">
        <h1>Statistici Magazin</h1>
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

        <div className="statCard">
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
            {pins.length > 0 ? (
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
                  {pins.map((pin) => {
                    // Calculăm numărul de like-uri în funcție de formatul datelor (array sau număr)
                    const likesCount = Array.isArray(pin.likes) ? pin.likes.length : (pin.likes || 0);
                    
                    return (
                      <tr key={pin._id}>
                        <td>
                          <img 
                            src={pin.media || pin.img || "/general/noAvatar.jpg"} 
                            alt="Pin thumbnail" 
                            className="tableImg" 
                          />
                        </td>
                        <td className="tableTitle" title={pin.title}>
                          {pin.title ? (pin.title.length > 30 ? pin.title.substring(0, 30) + "..." : pin.title) : "Fără titlu"}
                        </td>
                        <td>{pin.views || 0}</td>
                        {/* Prioritizăm linkClicks dacă există, altfel afișăm click-urile generale */}
                        <td><strong>{pin.linkClicks !== undefined ? pin.linkClicks : (pin.clicks || 0)}</strong></td>
                        <td>{likesCount}</td>
                        <td>{pin.commentCount || 0}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p style={{ textAlign: "center", padding: "20px", color: "#a48374" }}>Nu există date pentru postări momentan.</p>
            )}
          </div>
        </div>
      )}

      <div className="billingSection">
        <h2>Estimare Costuri (Vizibilitate)</h2>
        <div className="billCard">
          <div className="billRow">
            <span>Cost din Vizualizări ({totalViews} x {monetization?.costPerView})</span>
            <span>{(totalViews * (monetization?.costPerView || 0)).toFixed(2)} RON</span>
          </div>
          <div className="billRow">
            <span>Cost din Click-uri ({totalClicks} x {monetization?.costPerClick})</span>
            <span>{(totalClicks * (monetization?.costPerClick || 0)).toFixed(2)} RON</span>
          </div>
          <hr />
          <div className="billRow total">
            <span>Total de Plată</span>
            <span>{monetization?.totalCost || "0.00"} RON</span>
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