import { Link } from 'react-router-dom';
import NImage from '../image/image';
import './leftBar.css';

const LeftBar = () => {
  return (
    <div className="leftBar">
      <div className="menuIcons">
        <Link to="/" className="menuIcon">
        <NImage src="/general/logo.png" alt="" className="logo"/>
        </Link>
        <Link to="/" className="menuIcon">
        <NImage src="/general/home.svg" alt="a" />
        </Link>
        <Link to="/weather" className="menuIcon"> 
        <NImage src="/general/sun-behind-rain-cloud.svg"  alt="Ținute Vreme" />
        </Link>
        <Link to="/create" className="menuIcon"> 
        <NImage src="/general/create.svg" alt="a" />
        </Link>      
        <Link to="/" className="menuIcon"> 
        <NImage src="/general/updates.svg" alt="a" />
        </Link> 
        <Link to="/" className="menuIcon"> 
        <NImage src="/general/messages.svg" alt="a" />
        </Link>                          
      </div>
        <Link to="/settings" className="menuIcon"> 
        <NImage src="/general/settings.svg" alt="a" />
        </Link>       
    </div>
  );
};

export default LeftBar;