import './postPage.css';
import NImage from '../../components/image/image';
import PostInteractions from '../../components/postInteractions/postInteractions';
import { Link, useParams, useNavigate } from 'react-router-dom';
import Comments from '../../components/comments/comments';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useState, useEffect } from 'react';
import useAuthStore from '../../utils/authStore';
import EditPin from '../../components/editPin/editPin';

const Postpage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { currentUser } = useAuthStore();

  const { isLoading, error, data } = useQuery({
    queryKey: ["pin", id],
    queryFn: () => apiRequest.get(`/pins/${id}`).then((res) => res.data),
    enabled: !!id,
  });

  const deleteMutation = useMutation({
    mutationFn: (pinId) => apiRequest.delete(`/pins/${pinId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pins"] });
      navigate("/");
    },
    onError: (err) => {
      alert("Ștergerea a eșuat: " + (err.response?.data?.message || err.message));
    }
  });

    

  useEffect(() => {
    if (id) {
      apiRequest.put(`/pins/${id}/view`).catch(err => console.error(err));
    }
  }, [id]);

  if (isLoading) return "Loading...";
  if (error) return "An error has occurred: " + error.message;
  if (!data) return "Pin not found!";

  const displayTags = data?.tags;
  const isOwner = currentUser?._id === data?.user?._id;

  const handleDelete = () => {
    if (window.confirm("Ești sigur că vrei să ștergi acest pin?")) {
      deleteMutation.mutate(data._id);
    }
  };

  const handleOpenEdit = () => {
    setIsEditModalOpen(true);
  };

  const handleLinkClick = () => {
    apiRequest.put(`/pins/${id}/click`).catch(err => console.error(err));
  };

  const handleParticipate = () => {
    if (!currentUser) {
      alert("Trebuie să fii logat ca să participi la concurs.");
      return;
    }
    navigate(`/contest/${data._id}/participate`);
  };
  
  return (
    <>
      <div className="postPage">
        <svg
          height="20"
          viewBox="0 0 24 24"
          width="20"
          style={{ cursor: "pointer" }}
          onClick={() => navigate(-1)}
        >
          <path d="M8.41 4.59a2 2 0 1 1 2.83 2.82L8.66 10H21a2 2 0 0 1 0 4H8.66l2.58 2.59a2 2 0 1 1-2.82 2.82L1 12z"></path>
        </svg>

        <div className="postContainer">
          <div className="postImg">
            <NImage src={data.media} alt={data.title || "Imaginea postării"} w={736} />
          </div>

          <div className="postDetails">
            
            <PostInteractions
              postId={id}
              isOwner={isOwner}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
              isDeleting={deleteMutation.isPending}
            />

            <div className="postTags">
              {displayTags?.map((tag, index) => (
                <Link to={`/search?tag=${tag}`} key={index} className="tagItem">
                  {tag}
                </Link>
              ))}
            </div>

            <div className="postInfo">
              {data.type === 'contest' && (
                <div className="contestHighlight">
                  <div className="contestHeader">
                    <span>🏆 CONCURS ACTIV</span>
                  </div>

                  <div className="contestBody">
                    <p><strong>Premiu:</strong> {data.prize || "Nespecificat"}</p>

                    {data.deadline && (
                      <p>
                        ⏳ Deadline: {new Date(data.deadline).toLocaleDateString('ro-RO')}
                      </p>
                    )}

                    <button
                      onClick={handleParticipate}
                      style={{
                        marginTop: 10,
                        background: "#e60023",
                        color: "white",
                        border: "none",
                        padding: "12px 16px",
                        borderRadius: 999,
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      📸 Participă la concurs
                    </button>
                  </div>
                </div>
              )}

              {data.link && (
                <a
                  href={data.link.startsWith('http') ? data.link : `https://${data.link}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                >
                  🛒 Vezi produsul
                </a>
              )}

              <p className="postTitle">{data.title}</p>
              <p className="postDescription">{data.description}</p>

              <Link to={`/profile/${data.user.username}`} className="postUser">
                <NImage src={data.user.img || "/general/noAvatar.jpg"} />
                <span>{data.user.displayName}</span>
              </Link>
            </div>

            <Comments id={data._id} />
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <EditPin pin={data} onClose={() => setIsEditModalOpen(false)} />
      )}
    </>
  );
};

export default Postpage;