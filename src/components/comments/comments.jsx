import './comments.css';
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import CommentForm from "./commentForm";
import Comment from "./comment";

const Comments = ({ id }) => {

  const { isPending, error, data } = useQuery({
    queryKey: ["comments", id],
    queryFn: () => apiRequest.get(`/comments/${id}`).then((res) => res.data),
    enabled: !!id, 
  });

  if (isPending) return "Loading comments...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="comments">
      <div className="commentList">
        <span className='commentCount'>
          {data.length === 0 ? "No comments" : data.length + " Comments"}
        </span>
        {data.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
      <CommentForm id={id} />
    </div>
  )
}

export default Comments;