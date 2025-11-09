import './galleryItem.css';
import {Link, useNavigate} from "react-router-dom";
import NImage from '../image/image';
import { useState } from 'react';
import Save from '../save/save';
import useAuthStore from '../../utils/authStore';


const GalleryItem = ({item}) => {
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
    const { currentUser } = useAuthStore();
    const navigate = useNavigate();

    const handleSaveClick = (e) => {
    e.preventDefault(); 
    e.stopPropagation();

    if (!currentUser) {
      navigate("/auth");
      return;
    }
    setIsSaveModalOpen(true);
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
                    <button>
                        <NImage src="/general/more.svg" alt=""/>
                    </button>
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