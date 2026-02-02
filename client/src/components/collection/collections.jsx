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

  if (!data || data.length === 0) {
    return (
      <div style={{
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center", 
        padding: "60px 20px", 
        color: "#666",
        textAlign: "center",
        width: "100%"
      }}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>📂</div>
        <h3 style={{fontSize: "20px", fontWeight: "600", marginBottom: "8px"}}>
          Încă nu există nimic salvat.
        </h3>
      </div>
    );
  }

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
            {board.isSecret && (
      <div style={{
        position: 'absolute', 
        top: '10px', 
        left: '10px', 
        background: 'rgba(255,255,255,0.9)', 
        padding: '6px', 
        borderRadius: '50%',
        width: '24px',
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
      }}>
        🔒
      </div>
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