import './galleryItem.css';
import {Link} from "react-router-dom";
import NImage from '../image/image';


const GalleryItem = ({item}) => {

const optimizedHeight = Math.round((472 * item.height) / item.width);
    return (
        <div className="galleryItem" style={{gridRowEnd: `span ${Math.ceil(item.height/100)}`}}>
            <NImage src={item.media} alt="" w={472} h={optimizedHeight} />
            <Link to={`/pin/${item._id}`} className = "overlay"/>
            <button className="saveButton">Save</button>
            <div className="overlayIcons">
                <button>
                    <NImage src="/general/share.svg" alt=""/>
                </button>
                <button>
                    <NImage src="/general/more.svg" alt=""/>
                </button>
            </div>
        </div>
    );
};

export default GalleryItem;