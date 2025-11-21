import NImage from "../../components/image/image";
import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminGallery.css";

const AdminGalleryItem = ({ item }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (pinId) => apiRequest.delete(`/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
    },
    onError: (err) => {
      alert("Eroare la ștergere: " + err.response?.data?.message);
    }
  });

  const handleDelete = (e) => {
    e.preventDefault();
    if (window.confirm("Sigur vrei să ștergi acest pin definitiv?")) {
      deleteMutation.mutate(item._id);
    }
  };

  return (
    <div className="adminGalleryItem">
      <div className="adminImageContainer">
        <NImage src={item.media} alt={item.title} w="100%" h="auto" />
        {/* Overlay simplificat doar pentru Admin */}
        <div className="adminOverlay">
          <button onClick={handleDelete} className="adminDeleteBtn">
            Șterge Pin
          </button>
          <Link to={`/pin/${item._id}`} className="adminViewLink">
            Vezi Detalii
          </Link>
        </div>
      </div>
      
      <div className="adminItemInfo">
        <h4>{item.title}</h4>
        <small>By: {item.user?.username || "Unknown"}</small>
      </div>
    </div>
  );
};

export default AdminGalleryItem;