import {useState} from 'react';
import Gallery from '../../components/gallery/gallery';
import { Link } from 'react-router-dom';
import NImage from '../../components/image/image'; // Asigură-te că calea e corectă
import './homePage.css'; // Vom crea acest fișier imediat


const Homepage = () => {
    const [feedType, setFeedType] = useState("recommended");

    return (
        <div className="homePageContainer pageFadeIn">
            <div className="homeBanner">
                <div className="bannerContent">
                    <h2 className="bannerTitle">
                        <span className="bannerTrophy" aria-hidden="true">
                            <svg viewBox="0 0 64 64" role="img">
                                <path d="M20 10h24v6a12 12 0 0 1-24 0v-6z" className="trophyCup" />
                                <path d="M16 12H8c0 10 6 16 14 18" className="trophyHandle" />
                                <path d="M48 12h8c0 10-6 16-14 18" className="trophyHandle" />
                                <path d="M26 34h12v8H26z" className="trophyStem" />
                                <path d="M22 42h20v6H22z" className="trophyBase" />
                            </svg>
                        </span>
                        Concursuri Active
                    </h2>
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
