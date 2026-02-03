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
  const { currentUser, updateCurrentUser } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isJoined, setIsJoined] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // ✅ 1. VERIFICĂM DACĂ E ÎNCHEIAT
  // Un concurs e gata dacă are un winner SAU a trecut deadline-ul
  const isContestEnded = item.type === "contest" && (
    !!item.winner || (item.deadline && new Date(item.deadline) < new Date())
  );

  useEffect(() => {
    setIsJoined(false);
    setFeedbackMsg("");
  }, [item?._id]);

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
    alert("Pin-ul a fost raportat.");
    setIsMenuOpen(false);
  };

  const handleJoinContest = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!currentUser) {
      navigate("/auth");
      return;
    }

    if (isJoined) {
      setFeedbackMsg("Ești deja înscris la acest concurs.");
      setTimeout(() => setFeedbackMsg(""), 1800);
      return;
    }

    const oldG = normalizeGamification(currentUser.gamification);
    const updatedG = applyPointsAndBadges(
      oldG,
      ACTION_POINTS.CONTEST_JOIN,
      {
        contestJoins: (oldG.contestJoins ?? 0) + 1,
      }
    );

    const updatedUser = {
      ...currentUser,
      gamification: {
        ...updatedG,
      },
    };
    delete updatedUser.gamification._newBadges;

    updateCurrentUser(updatedUser);
    setIsJoined(true);

    const unlocked = updatedG._newBadges || [];
    if (unlocked.length > 0) {
      setFeedbackMsg(
        `+${ACTION_POINTS.CONTEST_JOIN} puncte! Badge nou: ${unlocked
          .map((b) => b.icon)
          .join(" ")}`
      );
    } else {
      setFeedbackMsg(`+${ACTION_POINTS.CONTEST_JOIN} puncte! Te-ai înscris.`);
    }

    setTimeout(() => setFeedbackMsg(""), 2200);
  };

  return (
    <div className={`galleryItem ${item.type === "contest" ? "contestItem" : ""}`}>
      <div className="galleryImageContainer">
        <NImage src={item.media} alt={item.title || ""} w="100%" h="auto" />

        {item.type === "contest" && (
          <div className="contestBadge">
            {/* Putem schimba textul badge-ului dacă e încheiat */}
            <span>{isContestEnded ? "🏁 ÎNCHEIAT" : "🏆 CONCURS"}</span>
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
              </div>
            )}
          </div>
        </div>

        {/* ✅ 2. AICI E MODIFICAREA PRINCIPALĂ */}
        {/* Afișăm butonul DOAR dacă e concurs ȘI NU este încheiat */}
        {item.type === "contest" && !isContestEnded && (
          <div
            style={{
              position: "absolute",
              left: 12,
              bottom: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8,
              zIndex: 5,
            }}
          >
            <button
              onClick={handleJoinContest}
              style={{
                border: "none",
                padding: "10px 14px",
                borderRadius: 999,
                fontWeight: 800,
                cursor: "pointer",
                background: isJoined ? "#670626" : "#f8bbd0",
                color: isJoined ? "#fff8f0" : "#670626",
              }}
            >
              {isJoined ? "Înscris ✅" : "Participă"}
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
