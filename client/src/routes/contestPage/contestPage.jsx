import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./contestPage.css"; 
import { Link } from "react-router-dom";
import GalleryItem from "../../components/galleryItem/GalleryItem"; 
import { useState } from "react"; 

const ContestPage = () => {
  const INITIAL_LIMIT = 5;

  // Stare separată pentru fiecare secțiune
  const [visibleActive, setVisibleActive] = useState(INITIAL_LIMIT);
  const [visibleEnded, setVisibleEnded] = useState(INITIAL_LIMIT);

  const { isPending, error, data } = useQuery({
    queryKey: ["contestPins"],
    queryFn: () => apiRequest.get("/pins?type=contest").then((res) => res.data),
  });

  const allPins = data?.pins || [];
  const now = new Date();

  // --- FILTRARE ---
  const activeContests = allPins.filter((pin) => {
    const hasWinner = !!pin.winner;
    const isExpired = pin.deadline && new Date(pin.deadline) < now;
    return !hasWinner && !isExpired;
  });

  const endedContests = allPins.filter((pin) => {
    const hasWinner = !!pin.winner;
    const isExpired = pin.deadline && new Date(pin.deadline) < now;
    return hasWinner || isExpired;
  });

  // --- FUNCȚII DE TOGGLE (Mai Mult / Mai Puțin) ---
  
  // Pentru Active
  const toggleActive = () => {
    if (visibleActive < activeContests.length) {
      setVisibleActive(activeContests.length); // Arată tot
    } else {
      setVisibleActive(INITIAL_LIMIT); // Revino la 6
    }
  };

  // Pentru Încheiate
  const toggleEnded = () => {
    if (visibleEnded < endedContests.length) {
      setVisibleEnded(endedContests.length); // Arată tot
    } else {
      setVisibleEnded(INITIAL_LIMIT); // Revino la 6
    }
  };

  if (error) return <div className="centerMsg">Eroare la încărcare!</div>;
  if (isPending) return <div className="centerMsg">Se încarcă concursurile...</div>;

  return (
    <div className="contestPage">
      {/* --- BANNER --- */}
      <div className="contestBanner">
        <div className="bannerContent">
          <h1>Concursuri</h1>
          <p>Participă și câștigă premii!</p>
        </div>
        <div className="bannerIcon">🏆</div>
      </div>

      {/* ================= SECȚIUNEA 1: ACTIVE ================= */}
      <div className="contestSection">
        <h2 className="sectionTitle activeTitle">🔥 Concursuri Active</h2>
        
        {activeContests.length === 0 ? (
           <div className="noContests">
              <p>Nu sunt concursuri active momentan.</p>
              <Link to="/create"><button className="createBtn">Creează unul</button></Link>
           </div>
        ) : (
          <>
            <div className="contestGrid">
              {activeContests.slice(0, visibleActive).map((pin) => (
                 <GalleryItem key={pin._id} item={pin} />
              ))}
            </div>

            {/* Buton Active */}
            {activeContests.length > INITIAL_LIMIT && (
              <div className="loadMoreContainer">
                <button className="loadMoreBtn" onClick={toggleActive}>
                  {visibleActive < activeContests.length 
                    ? `Vezi mai multe (${activeContests.length - visibleActive} rămase) ▼` 
                    : "Vezi mai puțin ▲"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="divider"></div>

      {/* ================= SECȚIUNEA 2: ÎNCHEIATE ================= */}
      <div className="contestSection">
        <h2 className="sectionTitle endedTitle">🏁 Concursuri Încheiate</h2>
        
        {endedContests.length === 0 ? (
           <p className="noData">Niciun concurs finalizat încă.</p>
        ) : (
          <>
            <div className="contestGrid endedGrid">
              {endedContests.slice(0, visibleEnded).map((pin) => (
                 <div key={pin._id} style={{ position: 'relative' }}>
                     <GalleryItem item={pin} />
                 </div>
              ))}
            </div>

            {/* Buton Încheiate */}
            {endedContests.length > INITIAL_LIMIT && (
              <div className="loadMoreContainer">
                <button className="loadMoreBtn" onClick={toggleEnded}>
                  {visibleEnded < endedContests.length 
                    ? `Vezi mai multe (${endedContests.length - visibleEnded} rămase) ▼` 
                    : "Vezi mai puțin ▲"}
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default ContestPage;