import Gallery from "../../components/gallery/gallery";
import AdminGalleryItem from "../../components/adminGallery/adminGallery";
import "./adminPinPage.css";

const AdminPinsPage = () => {
  return (
    <div className="adminPage">
      <h1>Moderare Conținut (Pinuri)</h1>
      <p>Gestionează toate postările din platformă.</p>
      <Gallery 
        renderItem={(pin) => <AdminGalleryItem item={pin} />} 
      />
    </div>
  );
};

export default AdminPinsPage;