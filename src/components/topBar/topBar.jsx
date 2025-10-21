import UserButton from '../userButton/userButton';
import './topBar.css';

const TopBar = () => {
  return (
    <div className="topBar">
        <div className="search">
            <img src="/general/search.svg" alt=""/>
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