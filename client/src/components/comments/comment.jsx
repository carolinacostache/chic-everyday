import NImage from "../image/image";
import { format } from "timeago.js";
import { Link, useParams } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";

const Comment = ({ comment }) => {
  const { id: pinId } = useParams(); // id-ul pinului
  const queryClient = useQueryClient();

  const likeMutation = useMutation({
    mutationFn: () =>
      apiRequest.post(`/pins/${pinId}/entries/${comment._id}/like`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", pinId] });
    },
  });

  const handleLike = () => {
    likeMutation.mutate();
  };

  return (
    <div className="comment">
      <Link to={`/profile/${comment.user.username}`}>
        <NImage
          src={comment.user.img || "/general/noAvatar.jpg"}
          alt={comment.user.displayName}
        />
      </Link>

      <div className="commentContent">
        <Link to={`/profile/${comment.user.username}`}>
          <span className="commentUsername">
            {comment.user.displayName}
          </span>
        </Link>

        {comment.description && (
          <p className="commentText">{comment.description}</p>
        )}

        {/* poza din comentariu (contest entry) */}
        {comment.img && (
          <img
            src={comment.img}
            alt="comment"
            className="commentImage"
          />
        )}

        {/* ✅ LIKE doar pentru concurs */}
        {comment.type === "contestEntry" && (
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <button
              onClick={handleLike}
              disabled={likeMutation.isPending}
              style={{
                border: "none",
                background: "transparent",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              {comment.likedByMe ? "❤️" : "🤍"}
            </button>

            <span style={{ fontSize: "13px", color: "#670626" }}>
              {comment.likeCount}
            </span>
          </div>
        )}

        <span className="commentTime">
          {format(comment.createdAt)}
        </span>
      </div>
    </div>
  );
};

export default Comment;