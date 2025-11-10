import './galleryItem.css';
import {Link, useNavigate} from "react-router-dom";
import NImage from '../image/image';
import { useState, useRef, useEffect } from 'react';
import Save from '../save/save';
import useAuthStore from '../../utils/authStore';
import PostInteractions from '../postInteractions/postInteractions';


const GalleryItem = ({item}) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const { currentUser } = useAuthStore();
    const navigate = useNavigate();

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

    const handleSaveClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setIsSaveModalOpen(true);
  };

    const handleMenuToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((prev) => !prev);
  };

    const handleReportClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    alert("Pin-ul a fost raportat (funcționalitate de implementat).");
    setIsMenuOpen(false);
  };



    return (
        <div className="galleryItem">
            
            <div className="galleryImageContainer">
                <NImage src={item.media} alt={item.title || ""} w="100%" h="auto" />
                <Link to={`/pin/${item._id}`} className = "overlay"/>
                <button className="saveButton" onClick={handleSaveClick} >Save</button>
                <div className="overlayIcons">
                    <button>
                        <NImage src="/general/share.svg" alt=""/>
                    </button>
                    <div className="galleryMenuContainer" ref={menuRef}>
                        <button onClick={handleMenuToggle}>
                        <NImage src="/general/more.svg" alt="" />
                        </button>

                        {isMenuOpen && (
                        <div className="optionsMenu galleryOverlayMenu">
                            <button onClick={handleReportClick}>Raportează</button>
                        </div>
                        )}
                    </div>
                </div>
            </div>


            {item.title && (
                <div className="galleryTitleContainer">
                    <h4>{item.title}</h4>
                </div>
            )}

            {isSaveModalOpen && (
                <Save 
                    pinId={item._id} 
                    onClose={() => setIsSaveModalOpen(false)} 
                />
      )}

        </div>
    );
};

export default GalleryItem;