import "./profilePage.css";
import Image from "../../components/image/image";
import { useState, useRef, useEffect } from "react";
import Collections from "../../components/collection/collections";
import Gallery from "../../components/gallery/gallery";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import apiRequest from "../../utils/apiRequest";
import FollowButton from "./FollowButton";
import FollowListModal from "../../components/followListModal/followListModal";
import useAuthStore from "../../utils/authStore";
import { Link } from "react-router-dom";

import { getNextLevelInfo, normalizeGamification } from "../../utils/gamificationRules";

const Profilepage = () => {
  const [type, setType] = useState("saved");
  const [modalType, setModalType] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const { username } = useParams();
  const { currentUser } = useAuthStore();

  const { isPending, error, data } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => apiRequest.get(`/users/${username}`).then((res) => res.data),
  });

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  if (!data) return "User not found!";

  if (data.role === "BANNED") {
    return (
      <div className="profilePage bannedProfile">
        <div className="bannedMessageCard">
          <span className="bannedIcon">🚫</span>
          <h1>Cont Suspendat</h1>
          <p>Acest cont a fost restricționat pentru încălcarea regulamentului platformei.</p>
          {data.banReason && (
            <div className="banReasonBox">
              <strong>Motiv:</strong> {data.banReason}
            </div>
          )}
          <Link to="/" className="backHomeBtn">Înapoi la pagina principală</Link>
        </div>
      </div>
    );
  }

  const isOwnProfile = currentUser?._id === data._id;

  const gamification = normalizeGamification(data.gamification);
  const next = getNextLevelInfo(gamification.points);

  return (
    <>
      <div className="profilePage pageFadeIn">
        <Image
          className="profileImg"
          w={100}
          h={100}
          src={data.img || "/general/noAvatar.jpg"}
          alt={data.displayName}
        />

        <h1 className="profileName">{data.displayName}</h1>
        <span className="profileUsername">@{data.username}</span>

        <div className="followCount">
          <span className="followLink" onClick={() => setModalType("followers")}>
            {data.followerCount} followers
          </span>
          <span> · </span>
          <span className="followLink" onClick={() => setModalType("following")}>
            {data.followingCount} following
          </span>
        </div>

        <div className="profileInteractions">
          <div className="profileButtons">
            {isOwnProfile ? (
              <Link to="/settings">
                <button className="editProfileButton">Edit Profile</button>
              </Link>
            ) : (
              <>
                <FollowButton username={data.username} />
              </>
            )}
          </div>
        </div>
        <div className="gamificationContainer">
          <div className="levelWrapper">
            <div className="levelBadge">
              LVL <strong>{gamification.level}</strong>
            </div>
            <div className="pointsInfo">
              <span className="pointsValue">{gamification.points}</span>
              <span className="pointsLabel">Fashion Points</span>
            </div>
            <span className="tierBadge">
              {gamification.level >= 15
                ? "Diamond"
                : gamification.level >= 10
                ? "Gold"
                : gamification.level >= 5
                ? "Silver"
                : "Bronze"}
            </span>
          </div>

          <div className="progressWrapper">
            <div className="progressTop">
              <span>Progres catre LVL {next.level + 1}</span>
              <span>{next.remaining} puncte ramase</span>
            </div>

            <div className="progressBar">
              <div className="progressFill" style={{ width: `${next.progress}%` }} />
            </div>
            <Link to="/badges-info" className="gamificationInfoLink">
              💡 Ce înseamnă fashion points și cum câștig insigne?
            </Link>
          </div>

          <div className="badgesWrapper">
            {gamification.badges.length > 0 ? (
              gamification.badges.map((badge, index) => (
                <div key={badge.key || index} className="badgeItem" title={badge.name}>
                  <span className="badgeIcon">{badge.icon}</span>
                </div>
              ))
            ) : (
              <span className="noBadgesText">Inca nu ai insigne. Fii activ!</span>
            )}
          </div>
        </div>

        <div className="profileOptions">
          <span
            onClick={() => setType("created")}
            className={type === "created" ? "active" : ""}
          >
            Created
          </span>

          <span
            onClick={() => setType("saved")}
            className={type === "saved" ? "active" : ""}
          >
            Saved
          </span>

          {data.role === "SHOP" && (
            <span
              onClick={() => setType("contests")}
              className={type === "contests" ? "active" : ""}
            >
              Concursuri
            </span>
          )}
        </div>
        <div className="profileGalleryWrapper">

        {type === "created" ? (
          <Gallery userId={data._id} />
        ) : type === "saved" ? (
          <Collections userId={data._id} />
        ) : (
          <Gallery userId={data._id} type="contest" />
        )}
        </div>
      </div>

      {modalType && (
        <FollowListModal
          userId={data._id}
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}
    </>
  );
};

export default Profilepage;
