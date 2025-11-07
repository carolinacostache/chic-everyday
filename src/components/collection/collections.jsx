import NImage from '../image/image';
import './collections.css'; 
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { format } from "timeago.js";
import { Link } from "react-router-dom"; 

const Collections = ({ userId }) => {
  const { isPending, error, data } = useQuery({
    queryKey: ["boards", userId],
    queryFn: () => apiRequest.get(`/boards/${userId}`).then((res) => res.data),
    enabled: !!userId, 
  });

  if (isPending) return "Loading...";
  if (error && !userId) return null; 
  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="collections">
      {data?.map((board) => (
        <Link
          to={`/search?boardId=${board._id}`}
          className="collection"
          key={board._id}
        >
          <div className="collectionImageContainer">
            {board.firstPin ? (
              <NImage src={board.firstPin.media} alt={board.title} />
            ) : (
              <div className="collectionImagePlaceholder" /> 
            )}
          </div>
          
          <div className="collectionInfo">
            <h1>{board.title}</h1>
            <span>
              {board.pinCount} Pins · {format(board.createdAt)}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default Collections;