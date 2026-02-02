import { Link } from 'react-router-dom';
import NImage from '../image/image';
import './leftBar.css';
import { useState, useRef, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";
import NotificationMenu from "../notificationMenu/NotificationMenu";

const LeftBar = () => {
  const { currentUser } = useAuthStore();
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);
  const { data: notifications } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest.get("/notifications").then((res) => res.data),
    enabled: !!currentUser,
    refetchInterval: 30000,
  });

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="leftBar">
      <div className="menuIcons">
        <Link to="/" className="menuIcon">
        <NImage src="/general/chiceveryday.png" alt="" className="logo"/>
        </Link>
        <Link to="/" className="menuIcon">
        <NImage src="/general/home.svg" alt="a" />
        </Link>
        <Link to="/weather" className="menuIcon"> 
        <NImage src="/general/sun-behind-rain-cloud.svg"  alt="Ținute Vreme" />
        </Link>
        <Link to="/contests" className="menuIcon">
        <NImage src="/general/contest.svg" alt="a" />
        </Link>
        <Link to="/create" className="menuIcon"> 
        <NImage src="/general/create.svg" alt="a" />
        </Link>      
        {/*}
        <Link to="/" className="menuIcon"> 
        <NImage src="/general/messages.svg" alt="a" />
        </Link>
        */}                          
      </div>
        <Link to="/settings" className="menuIcon"> 
        <NImage src="/general/settings.svg" alt="a" />
        </Link>       
    </div>
  );
};

export default LeftBar;