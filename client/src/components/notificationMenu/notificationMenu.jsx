import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import NImage from "../image/image";
import { Link } from "react-router-dom";
import { format } from "timeago.js";
import { useEffect } from "react";
import "./notificationMenu.css";

const NotificationMenu = ({ onClose }) => {
  const queryClient = useQueryClient();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiRequest.get("/notifications").then((res) => res.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => apiRequest.put(`/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest.put("/notifications/read-all"),
    onSuccess: () => {
      // Invalidăm query-ul pentru ca badge-ul din TopBar să se actualizeze la 0
      queryClient.invalidateQueries(["notifications"]);
    },
  });

  useEffect(() => {
    markAllReadMutation.mutate();
  }, []);

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification._id);
    }
    onClose();
  };

  const getLink = (n) => {
      if (n.pin) return `/pin/${n.pin._id}`;
      if (n.sender) return `/profile/${n.sender.username}`;
      return "#"; // Dacă nu avem nici pin, nici user, nu ducem nicăieri
    };

  if (isLoading) return <div className="notifMenu loading">Se încarcă...</div>;

  return (
    <div className="notificationMenu">
      <div className="notifHeader">
        <h3>Notificări</h3>
      </div>
      
      <div className="notifList">
        {notifications?.length === 0 && (
          <p className="noNotif">Nu ai notificări noi.</p>
        )}

        {notifications?.map((n) => (
          <Link 
            to={getLink(n)}
            key={n._id} 
            className={`notifItem ${!n.isRead ? "unread" : ""}`}
            onClick={() => handleNotificationClick(n)}
            style={{ pointerEvents: (!n.pin && !n.sender) ? "none" : "auto" }}
          >
            <div className="notifAvatar">
              <NImage src={n.sender?.img || "/general/noAvatar.jpg"} alt="" />
            </div>
            <div className="notifContent">
              <p>
                <strong>{n.sender?.displayName || "Utilizator Șters"}</strong>
                {n.type === "like" && " ți-a apreciat postarea."}
                {n.type === "comment" && " a comentat la postarea ta."}
                {n.type === "follow" && " a început să te urmărească."}
              </p>
              <span className="notifTime">{format(n.createdAt)}</span>
            </div>
            {n.pin && n.pin.media && (
              <div className="notifPinPreview">
                <NImage src={n.pin.media} alt="" />
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NotificationMenu;