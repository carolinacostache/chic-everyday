import { useState, useRef, useEffect } from 'react'
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

    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpen(false); 
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);



    const goToProfile = () => {
        if (currentUser?.username) {
            navigate(`/profile/${currentUser.username}`);
            setOpen(false);
        }
    };

    const handleLogout = async () => {
      setOpen(false);
    try {
      await apiRequest.post("/users/auth/logout", {});
      removeCurrentUser();
      navigate("/auth");
    } catch (err) {
      console.log(err);
    }


  };

    return currentUser ? (
        <div className="userButton" ref={menuRef}>
            <div onClick={goToProfile} style={{cursor:'pointer'}}>
            <NImage src={currentUser.img || "/general/noAvatar.jpg"} alt="" />
            </div>
            <div onClick={() => setOpen((prev) => !prev)}>
            <NImage src='/general/arrow.svg' alt='' className={`arrow ${open ? 'open' : ''} `}/>
            </div>
            {open && (<div className="userOptions">
                <Link to={`/profile/${currentUser.username}`} className="userOption" onClick={() => setOpen(false)}> 
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
  <NImage src="/general/edit.svg" alt="Login / Sign Up" /> 
  <span>Login / Sign Up</span>
</Link>
  );
};
export default UserButton;