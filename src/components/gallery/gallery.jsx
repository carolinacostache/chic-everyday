 import './gallery.css';
 
const Gallery = () => {     
    return (
        <div className="gallery">
            <h2 className="galleryTitle">Gallery</h2>
            <div className="galleryGrid">
                <div className="galleryItem">Image 1</div>
                <div className="galleryItem">Image 2</div>
                <div className="galleryItem">Image 3</div>
                <div className="galleryItem">Image 4</div>
            </div>
        </div>
    );
 };
 
 export default Gallery;