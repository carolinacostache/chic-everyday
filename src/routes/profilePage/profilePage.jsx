import './profilePage.css';
import Image from '../../components/image/image';
import { useState } from 'react'; 
import Collections from '../../components/collection/collections';
import Gallery from '../../components/gallery/gallery';
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router";
import apiRequest from "../../utils/apiRequest";
import FollowButton from "./FollowButton";
import FollowListModal from '../../components/followListModal/followListModal'; 
import useAuthStore from '../../utils/authStore';

const Profilepage = () => {
  const [type, setType] = useState("saved");
  const [modalType, setModalType] = useState(null);

  const { username } = useParams();

  const { currentUser } = useAuthStore();

  const { isPending, error, data } = useQuery({
    queryKey: ["profile", username],
    queryFn: () => apiRequest.get(`/users/${username}`).then((res) => res.data),
  });

  if (isPending) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  if (!data) return "User not found!";

  const isOwnProfile = currentUser?._id === data._id;
  
  return (
    <> 
      <div className="profilePage">
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
          <Image src="/general/share.svg" alt="Distribuie profilul" />
          <div className="profileButtons">
            {isOwnProfile ? (
              <button className="editProfileButton">Edit Profile</button>
            ) : (
              <>
            <button>Message</button>
            <FollowButton
              username={data.username}
            />
            </>
            )}
          </div>
          <Image src="/general/more.svg" alt="Mai multe opțiuni" />
           
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
            <span onClick={() => setType("contests")} className={type === "contests" ? "active" : ""}>
              Concursuri 🏆
            </span>
  )}
        </div>
        {type === "created" ? (
          <Gallery userId={data._id} />
        ) : type === "saved" ? (
          <Collections userId={data._id} />
        ) : (
          <Gallery userId={data._id} type="contest" />
        )}
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