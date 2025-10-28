import NImage from '../image/image';
import './leftBar.css';

const LeftBar = () => {
  return (
    <div className="leftBar">
      <div className="menuIcons">
        <a href="/" className="menuIcon">
        <NImage src="/general/logo.png" alt="" className="logo"/>
        </a>
        <a href="/" className="menuIcon">
        <NImage src="/general/home.svg" alt="" />
        </a>
        <a href="/" className="menuIcon"> 
        <NImage src="/general/create.svg" alt="" />
        </a>      
        <a href="/" className="menuIcon"> 
        <NImage src="/general/updates.svg" alt="" />
        </a> 
        <a href="/" className="menuIcon"> 
        <NImage src="/general/messages.svg" alt="" />
        </a>                          
      </div>
        <a href="/" className="menuIcon"> 
        <NImage src="/general/settings.svg" alt="" />
        </a>       
    </div>
  );
};

export default LeftBar;