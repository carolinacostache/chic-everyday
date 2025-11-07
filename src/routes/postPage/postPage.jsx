import './postPage.css';
import NImage from '../../components/image/image';
import PostInteractions from '../../components/postInteractions/postInteractions';
import { Link } from 'react-router-dom';
import Comments from '../../components/comments/comments';
import { useQuery } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useParams, useNavigate } from "react-router-dom"; 


const Postpage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); 

  const { isLoading, error, data } = useQuery({
    queryKey: ["pin", id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res) => res.data),
  });

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  if (!data) return "Pin not found!";

  console.log(data)
    return (
        <div className="postPage">
            <svg
              height="20"
              viewBox="0 0 24 24"
              width="20"
              style={{ cursor: "pointer"}}
              onClick={() => navigate(-1)} 
            > 
              <path d="M8.41 4.59a2 2 0 1 1 2.83 2.82L8.66 10H21a2 2 0 0 1 0 4H8.66l2.58 2.59a2 2 0 1 1-2.82 2.82L1 12z"></path>
            </svg>
            <div className="postContainer">
                <div className="postImg"> 
                    <NImage 
                      src={data.media} 
                      alt={data.title || "Imaginea postării"} 
                      w={736}
                    />
                </div>
                <div className="postDetails">
                  <PostInteractions postId={id}/>
                  <Link to={`/profile/${data.user.username}`} className="postUser">
                    <NImage 
                      src={data.user.img || "/general/noAvatar.jpg"}
                      alt={data.user.displayName}
                    />
                    <span> {data.user.displayName}</span>
                  </Link>
                  <Comments id={data._id}/>
                </div>
            </div>
        </div>
    )
};

export default Postpage;