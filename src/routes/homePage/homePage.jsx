import Gallery from '../../components/gallery/gallery';
import { Link } from 'react-router-dom';
import NImage from '../../components/image/image'; // Asigură-te că calea e corectă
import './homePage.css'; // Vom crea acest fișier imediat


const Homepage = () => {
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
            <Gallery/>
        </div>
    )
};

export default Homepage;