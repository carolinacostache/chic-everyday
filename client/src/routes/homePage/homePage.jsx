import {useState} from 'react';
import Gallery from '../../components/gallery/gallery';
import { Link } from 'react-router-dom';
import NImage from '../../components/image/image'; // Asigură-te că calea e corectă
import './homePage.css'; // Vom crea acest fișier imediat


const Homepage = () => {
    const [feedType, setFeedType] = useState("recommended");

    return (
        <div className="homePageContainer">
            <div className="homeBanner">
                <div className="bannerContent">
                    <h2>🏆 Concursuri Active</h2>
                    <p>Participă cu ținutele tale și câștigă premii!</p>
                    <Link to="/contests">
                        <button className="bannerBtn">Vezi Concursuri</button>
                    </Link>
                </div>
                <div className="bannerVisual">
                    <NImage src="/general/contest.jpeg" alt="Trophy" className="trophyImg" />
                </div>
            </div>
            <div className="feedToggleContainer">
                <button 
                    className={`feedTab ${feedType === "recommended" ? "active" : ""}`} 
                    onClick={() => setFeedType("recommended")}
                >
                    ❤️ Pentru Tine
                </button>
                <button 
                    className={`feedTab ${feedType === "newest" ? "active" : ""}`} 
                    onClick={() => setFeedType("newest")}
                >
                    ✨ Noutăți
                </button>
                
                <button 
                    className={`feedTab ${feedType === "following" ? "active" : ""}`} 
                    onClick={() => setFeedType("following")}
                >
                    👥 Urmărești
                </button>
            </div>

            {/* Trimitem feedType către Gallery ca să știe ce să ceară din backend */}
            <Gallery feedType={feedType}/>
        </div>
    )
};

export default Homepage;