import { useState } from 'react'
import './userButton.css'
import NImage from '../image/image';
import apiRequest from "../../utils/apiRequest";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../utils/authStore";

const UserButton = () => {

    const [open, setOpen] = useState(false);

    const navigate = useNavigate();

    const { currentUser, removeCurrentUser } = useAuthStore();

    console.log(currentUser);

    const goToProfile = () => {
        if (currentUser?.username) {
            navigate(`/profile/${currentUser.username}`);
        }
    };

    const handleLogout = async () => {
    try {
      await apiRequest.post("/users/auth/logout", {});
      removeCurrentUser();
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }


  };

    return currentUser ? (
        <div className="userButton">
            <div onClick={goToProfile} style={{cursor:'pointer'}}>
            <NImage src={currentUser.img || "/general/noAvatar.jpg"} alt="" />
            </div>
            <div onClick={() => setOpen((prev) => !prev)}>
            <NImage src='/general/arrow.svg'
            alt="" 
            className="arrow"
            />
            </div>
            {open && (<div className="userOptions">
                <Link to={`/profile/${currentUser.username}`} className="userOption">
            Profile
          </Link>
          <div className="userOption">Setting</div>
          <div className="userOption" onClick={handleLogout}>
            Logout
          </div>
            </div>)}
        </div>
    ) : (
    <Link to="/auth" className="loginLink">
  <NImage src="/general/person.svg" alt="Login / Sign Up" /> 
  <span>Login / Sign Up</span>
</Link>
  );
};
export default UserButton;