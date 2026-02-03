import "./galleryItem.css";
import { Link, useNavigate } from "react-router-dom";
import NImage from "../image/image";
import { useState, useRef, useEffect } from "react";
import Save from "../save/save";
import useAuthStore from "../../utils/authStore";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

// contest join is handled by navigation to participate page

const GalleryItem = ({ item }) => {
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const { currentUser } = useAuthStore();

  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // no local join state; handled in participate page

  const deleteMutation = useMutation({
    mutationFn: (pinId) => apiRequest.delete(`/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
    },
    onError: (err) => {
      alert("Ștergerea a eșuat: " + err.response?.data?.message);
    },
  });

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm("Admin: Sigur vrei să ștergi acest pin?")) {
      deleteMutation.mutate(item._id);
    }
  };

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

  const handleJoinContest = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    navigate(`/contest/${item._id}/participate`);
  };

  return (
    <div className={`galleryItem ${item.type === "contest" ? "contestItem" : ""}`}>
      <div className="galleryImageContainer">
        <NImage src={item.media} alt={item.title || ""} w="100%" h="auto" />

        {item.type === "contest" && (
          <div className="contestBadge">
            <span>🏆 CONCURS</span>
          </div>
        )}

        <Link to={`/pin/${item._id}`} className="overlay" />

        <button className="saveButton" onClick={handleSaveClick}>
          Salvează
        </button>

        <div className="overlayIcons">
          <button>
            <NImage src="/general/share.svg" alt="" />
          </button>

          <div className="galleryMenuContainer" ref={menuRef}>
            <button onClick={handleMenuToggle}>
              <NImage src="/general/more.svg" alt="" />
            </button>

            {isMenuOpen && (
              <div className="optionsMenu galleryOverlayMenu">
                <button onClick={handleReportClick}>Raportează</button>
                {/* daca vrei admin delete din meniu, poti activa aici */}
                {/* {currentUser?.role === "ADMIN" && (
                  <button onClick={handleDelete}>Șterge</button>
                )} */}
              </div>
            )}
          </div>
        </div>

        {item.type === "contest" && (
          <div className="contestCta">
            <button onClick={handleJoinContest} className="contestJoinButton">
              Participă
            </button>
          </div>
        )}
      </div>

      <div className="galleryTitleContainer">
        <h4>{item.title}</h4>
        {item.type === "contest" && item.prize && (
          <p className="contestPrize">Premiu: {item.prize}</p>
        )}
      </div>

      {isSaveModalOpen && (
        <Save pinId={item._id} onClose={() => setIsSaveModalOpen(false)} />
      )}
    </div>
  );
};

export default GalleryItem;
