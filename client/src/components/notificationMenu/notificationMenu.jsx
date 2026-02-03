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
    return "#"; 
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
            className={`notifItem ${!n.isRead ? "unread" : ""} ${n.type === "contest_win" ? "winnerNotif" : ""}`}
            onClick={() => handleNotificationClick(n)}
            style={{ pointerEvents: (!n.pin && !n.sender) ? "none" : "auto" }}
          >
            <div className="notifAvatar">
              <NImage src={n.sender?.img || "/general/noAvatar.jpg"} alt="" />
            </div>
            
            <div className="notifContent">
              <p>
                {/* ✅ MODIFICARE AICI: Suport pentru text custom (Backend) sau logică standard */}
                {n.text ? (
                   <span dangerouslySetInnerHTML={{ __html: n.text.replace(/\n/g, '<br/>') }} />
                ) : (
                   <>
                      <strong>{n.sender?.displayName || "Utilizator Șters"}</strong>
                      {n.type === "like" && " ți-a apreciat postarea."}
                      {n.type === "comment" && " a comentat la postarea ta."}
                      {n.type === "follow" && " a început să te urmărească."}
                      {/* Fallback dacă nu avem n.text setat în backend */}
                      {n.type === "contest_win" && " te-a desemnat câștigătorul concursului! 🏆"}
                   </>
                )}
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