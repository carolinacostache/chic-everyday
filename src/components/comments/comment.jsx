import NImage from "../image/image";
import { format } from "timeago.js";
import { Link } from "react-router-dom"; 

const Comment = ({ comment }) => {
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
          <span className="commentUsername">{comment.user.displayName}</span>
        </Link>
        <p className="commentText">
          {comment.description}
        </p>
        <span className="commentTime">{format(comment.createdAt)}</span>
      </div>
    </div>
  );
};

export default Comment;