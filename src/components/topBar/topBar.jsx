import UserButton from '../userButton/userButton';
import './topBar.css';
import NImage from '../image/image';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";

const TopBar = () => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    navigate(`/search?search=${query}`);
    setQuery("");
  };

  useEffect(() => {
    setQuery("");
  }, [location.pathname]);

  return (
    <div className="topBar">
        <form onSubmit={handleSubmit} className="search">
        <NImage src="/general/search.svg" alt="" />
        <input 
          type="text" 
          placeholder="Search" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
        <UserButton />

    </div>
  );
};

export default TopBar;