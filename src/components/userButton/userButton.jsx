import { useState, useRef, useEffect } from 'react';
import './userButton.css';
import NImage from '../image/image';
import apiRequest from "../../utils/apiRequest";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../../utils/authStore";
import { useQuery } from "@tanstack/react-query";
import NotificationMenu from '../notificationMenu/NotificationMenu';

const UserButton = () => {
    // --- STATE PENTRU MENIU USER ---
    const [openUserMenu, setOpenUserMenu] = useState(false);
    const userMenuRef = useRef(null);

    // --- STATE PENTRU NOTIFICĂRI ---
    const [showNotif, setShowNotif] = useState(false);
    const notifRef = useRef(null);

    const navigate = useNavigate();
    const { currentUser, removeCurrentUser } = useAuthStore();

    // 1. Fetch Notificări (mutat din TopBar)
    const { data: notifications } = useQuery({
        queryKey: ["notifications"],
        queryFn: () => apiRequest.get("/notifications").then((res) => res.data),
        enabled: !!currentUser,
        refetchInterval: 30000,
    });

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    // 2. Gestionare Click Outside pentru MENIUL USER
    useEffect(() => {
        const handleClickOutsideUser = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setOpenUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideUser);
        return () => document.removeEventListener("mousedown", handleClickOutsideUser);
    }, [userMenuRef]);

    // 3. Gestionare Click Outside pentru NOTIFICĂRI
    useEffect(() => {
        const handleClickOutsideNotif = (event) => {
            if (notifRef.current && !notifRef.current.contains(event.target)) {
                setShowNotif(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutsideNotif);
        return () => document.removeEventListener("mousedown", handleClickOutsideNotif);
    }, [notifRef]);

    const goToProfile = () => {
        if (currentUser?.username) {
            navigate(`/profile/${currentUser.username}`);
            setOpenUserMenu(false);
        }
    };

    const handleLogout = async () => {
        setOpenUserMenu(false);
        try {
            await apiRequest.post("/users/auth/logout", {});
            removeCurrentUser();
            navigate("/auth");
        } catch (err) {
            console.log(err);
        }
    };

    // Dacă nu e logat, arată butonul de Login
    if (!currentUser) {
        return (
            <Link to="/auth" className="loginLink">
                <NImage src="/general/edit.svg" alt="Login / Sign Up" />
                <span>Login / Sign Up</span>
            </Link>
        );
    }

    // Dacă e logat, arată Notificări + Avatar
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            
            {/* --- ZONA NOTIFICĂRI --- */}
            <div className="notificationWrapper" ref={notifRef} style={{ position: 'relative' }}>
                <div 
                    className="notificationIcon" 
                    onClick={() => setShowNotif(!showNotif)}
                    style={{ cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center' }}
                >
                    <NImage src="/general/updates.svg" alt="Notificări" />
                    
                    {unreadCount > 0 && (
                        <span className="topBarBadge">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </div>

                {showNotif && (
                    <div className="topBarMenuContainer" style={{ position: 'absolute', top: '40px', right: '-60px', zIndex: 1000 }}>
                        <NotificationMenu onClose={() => setShowNotif(false)} />
                    </div>
                )}
            </div>

            {/* --- ZONA MENIU USER --- */}
            <div className="userButton" ref={userMenuRef} style={{ position: 'relative' }}>
                <div onClick={goToProfile} style={{ cursor: 'pointer' }}>
                    <NImage src={currentUser.img || "/general/noAvatar.jpg"} alt="" />
                </div>
                <div onClick={() => setOpenUserMenu((prev) => !prev)} style={{ cursor: 'pointer' }}>
                    <NImage src='/general/arrow.svg' alt='' className={`arrow ${openUserMenu ? 'open' : ''} `} />
                </div>
                
                {openUserMenu && (
                    <div className="userOptions">
                        <Link to={`/profile/${currentUser.username}`} className="userOption" onClick={() => setOpenUserMenu(false)}>
                            Profile
                        </Link>
                        {currentUser.isAdmin && (
                            <Link
                                to="/admin"
                                className="userOption adminLink"
                                onClick={() => setOpenUserMenu(false)}
                            >
                                Panou Admin
                            </Link>
                        )}
                        <Link to="/settings" className="userOption" onClick={() => setOpenUserMenu(false)}>Setări</Link>
                        <div className="userOption" onClick={handleLogout}>
                            Logout
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserButton;