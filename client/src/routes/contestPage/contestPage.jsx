import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./contestPage.css"; 
import { Link } from "react-router-dom";
// 1. IMPORTĂ COMPONENTA TA EXISTENTĂ
import GalleryItem from "../../components/galleryItem/GalleryItem"; 

const ContestPage = () => {
  
  const { isPending, error, data } = useQuery({
    queryKey: ["contestPins"],
    queryFn: () => 
      apiRequest.get("/pins?type=contest").then((res) => res.data),
  });

  const pins = data?.pins || [];

  return (
    <div className="contestPage">
      {/* --- BANNER --- */}
      <div className="contestBanner">
        <div className="bannerContent">
          <h1>Concursuri Active</h1>
          <p>Participă și câștigă premii!</p>
        </div>
        <div className="bannerIcon" aria-hidden="true">
          <svg viewBox="0 0 64 64" role="img">
            <path d="M20 10h24v6a12 12 0 0 1-24 0v-6z" className="trophyCup" />
            <path d="M16 12H8c0 10 6 16 14 18" className="trophyHandle" />
            <path d="M48 12h8c0 10-6 16-14 18" className="trophyHandle" />
            <path d="M26 34h12v8H26z" className="trophyStem" />
            <path d="M22 42h20v6H22z" className="trophyBase" />
          </svg>
        </div>
      </div>

      {/* --- GRIDUL DE POSTĂRI --- */}
      <div className="contestGrid">
        {error ? (
          <div className="centerMsg">Eroare la încărcare!</div>
        ) : isPending ? (
          <div className="centerMsg">Se încarcă concursurile...</div>
        ) : pins.length === 0 ? (
            <div className="noContests">
                <h2>Nu sunt concursuri active momentan.</h2>
                <Link to="/create"><button className="createBtn">Creează unul</button></Link>
            </div>
        ) : (
          // 2. FOLOSIM GALLERY ITEM AICI
          pins.map((pin) => (
             <GalleryItem key={pin._id} item={pin} />
          ))
        )}
      </div>
    </div>
  );
};

export default ContestPage;
