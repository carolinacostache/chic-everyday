import NImage from '../image/image';
import './postInteractions.css';
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect} from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import apiRequest from "../../utils/apiRequest";
import useAuthStore from "../../utils/authStore";
import Save from '../save/save.jsx';

const interact = async (id, type) => {
  const res = await apiRequest.post(`/pins/interact/${id}`, { type });
  return res.data;
};

const PostInteractions = ({ postId, isOwner, onEdit, onDelete, isDeleting }) => {
  const queryClient = useQueryClient();
  const queryKey = ["interactionCheck", postId];
  
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false); 

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  const { currentUser } = useAuthStore();
  const navigate = useNavigate(); 

useEffect(() => {
  const handleClickOutside = (event) => {
    if (menuRef.current && !menuRef.current.contains(event.target)) {
      setIsMenuOpen(false);
    }
  };

  document.addEventListener("mousedown", handleClickOutside);
  
  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [menuRef]);

  const { isPending, error, data } = useQuery({
    queryKey: queryKey,
    queryFn: () =>
      apiRequest
        .get(`/pins/interaction-check/${postId}`)
        .then((res) => res.data),
  });

  const likeMutation = useMutation({
    mutationFn: () => interact(postId, "like"),
    onMutate: async () => {
      setIsLikeLoading(true);
      await queryClient.cancelQueries({ queryKey: queryKey });
      const previousInteractionData = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (oldData) => {
        if (!oldData) return;
        return {
          ...oldData,
          isLiked: !oldData.isLiked,
          likeCount: oldData.isLiked ? oldData.likeCount - 1 : oldData.likeCount + 1,
        };
      });
      return { previousInteractionData };
    },
    onError: (err, variables, context) => {
      if (context?.previousInteractionData) {
        queryClient.setQueryData(queryKey, context.previousInteractionData);
      }
    },
    onSettled: () => {
      setIsLikeLoading(false);
      queryClient.invalidateQueries({ queryKey: queryKey });
    },
  });


  if (isPending) return <div className="postInteractions">Loading...</div>;
  if (error) return <div className="postInteractions">Error.</div>;
  if (!data) return <div className="postInteractions">Error loading data.</div>;

  const handleLikeClick = () => {
    if (isLikeLoading) return;
    if (!currentUser) {
      navigate("/auth"); 
      return;
    }
    likeMutation.mutate();
  };

  const handleSaveClick = () => {
    if (!currentUser) {
      navigate("/auth");
      return;
    }

    setIsSaveModalOpen(true); 
  };

 const handleEdit = () => {
    onEdit();
    setIsMenuOpen(false);
  };

  const handleDelete = () => {
    onDelete();
    setIsMenuOpen(false);
  }; 

  const handleReport = () => {
    alert("Pin-ul a fost raportat (funcționalitate de implementat).");
    setIsMenuOpen(false);
  };

  return (
    <>
      <div className="postInteractions">
        <div className="interactionIcons">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            onClick={handleLikeClick} 
            style={{ cursor: isLikeLoading ? 'wait' : 'pointer' }}
          >
            <path
              d="M12 6.00019C10.2006 3.90317 7.19377 3.2551 4.93923 5.17534C2.68468 7.09558 2.36727 10.3061 4.13778 12.5772C5.60984 14.4654 10.0648 18.4479 11.5249 19.7369C11.6882 19.8811 11.7699 19.9532 11.8652 19.9815C11.9483 20.0062 12.0393 20.0062 12.1225 19.9815C12.2178 19.9532 12.2994 19.8811 12.4628 19.7369C13.9229 18.4479 18.3778 14.4654 19.8499 12.5772C21.6204 10.3061 21.3417 7.07538 19.0484 5.17534C16.7551 3.2753 13.7994 3.90317 12 6.00019Z"
              stroke={data.isLiked ? "#e50829" : "#000000"}
              strokeWidth="2"
              fill={data.isLiked ? "#e50829" : "none"}
            />
          </svg>
          {data.likeCount}
          <NImage src="/general/share.svg" alt="Distribuie" />
          <div 
              className="moreOptionsButton" 
              onClick={() => {
                console.log("Meniul se deschide!");
                setIsMenuOpen(prev => !prev)}}
              ref={menuRef}
            >
              <NImage src="/general/more.svg" alt="Opțiuni" />
              
              {isMenuOpen && (
                <div className="optionsMenu">
                  {isOwner ? (
                    <>
                  <button onClick={handleEdit}>Editează</button>
                  <button onClick={handleDelete} className="deleteOption">
                    {isDeleting ? "Se șterge..." : "Șterge"}
                  </button>
                  </>
                  ) : (
                    <>
                    <button onClick={handleReport}>Raportează</button>
                    </>
                  )
                }
                </div>
              )}
            </div>
        </div>
        
        <button
          onClick={handleSaveClick} 
        >
          {data.isSaved ? "Saved" : "Save"}
        </button>
      </div>

      {isSaveModalOpen && (
        <Save 
          pinId={postId} 
          onClose={() => setIsSaveModalOpen(false)} 
        />
      )}
    </>
  );
};

export default PostInteractions;