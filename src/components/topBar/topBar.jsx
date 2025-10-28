import UserButton from '../userButton/userButton';
import './topBar.css';
import NImage from '../image/image';

const TopBar = () => {
  return (
    <div className="topBar">
        <div className="search">
            <NImage src="/general/search.svg" alt=""/>
            <input 
                type="text"
                placeholder="Search..."
                className="searchInput"
            /> 

        </div>
        <UserButton />

    </div>
  );
};

export default TopBar;