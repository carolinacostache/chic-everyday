import "./postPage.css";
import NImage from "../../components/image/image";
import PostInteractions from "../../components/postInteractions/postInteractions";
import { Link, useParams, useNavigate } from "react-router-dom";
import Comments from "../../components/comments/comments";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import { useState, useEffect } from 'react';
import useAuthStore from '../../utils/authStore';
import EditPin from '../../components/editPin/editPin';
import Confetti from 'react-confetti'; // ✅ Importat pentru efect

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

  // ✅ 1. Mutația pentru FINALIZAREA CONCURSULUI
  const pickWinnerMutation = useMutation({
    mutationFn: () => apiRequest.post(`/pins/${id}/finalize-winner`),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["pin", id] });
      alert(`🏆 ${res.data.message}`);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Eroare la alegerea câștigătorului.");
    }
  });

  useEffect(() => {
    if (id) {
      apiRequest.put(`/pins/${id}/view`).catch((err) => console.error(err));
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
    apiRequest.put(`/pins/${id}/click`).catch((err) => console.error(err));
  };

  const handleParticipate = () => {
    if (!currentUser) {
      alert("Trebuie să fii logat ca să participi la concurs.");
      return;
    }
    navigate(`/contest/${data._id}/participate`);
  };

  // ✅ 2. Funcția care declanșează extragerea
  const handlePickWinner = () => {
    if (window.confirm("Atenție! Această acțiune va încheia concursul și va alege câștigătorul pe baza voturilor. Continui?")) {
      pickWinnerMutation.mutate();
    }
  };

  return (
    <>
      <div className="postPage pageFadeIn">
        <button
          className="postBackButton"
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Înapoi"
        >
          <svg height="20" viewBox="0 0 24 24" width="20">
            <path d="M8.41 4.59a2 2 0 1 1 2.83 2.82L8.66 10H21a2 2 0 0 1 0 4H8.66l2.58 2.59a2 2 0 1 1-2.82 2.82L1 12z"></path>
          </svg>
        </button>

        <div className="postContainer">
          <div className="postImg">
            <NImage src={data.media} alt={data.title || "Imaginea postării"} />
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
              {data.type === "contest" && (
                <div className="contestHighlight">
                  <div className="contestHeader">
                    {/* Schimbăm titlul dacă s-a terminat */}
                    <span>{data.winner ? "🏁 CONCURS ÎNCHEIAT" : "🏆 CONCURS ACTIV"}</span>
                  </div>

                  <div className="contestBody">
                    <p><strong>Premiu:</strong> {data.prize || "Nespecificat"}</p>
                    {data.deadline && (
                      <p>⏳ Deadline: {new Date(data.deadline).toLocaleDateString('ro-RO')}</p>
                    )}

                    {/* ✅ 3. LOGICA VIZUALĂ: CÂȘTIGĂTOR vs BUTOANE */}
                    {data.winner ? (
                      <div className="winnerSection" style={{ 
                        background: '#f0fdf4', 
                        border: '2px solid #22c55e', 
                        padding: '20px', 
                        borderRadius: '12px',
                        textAlign: 'center',
                        marginTop: '15px',
                        position: 'relative',
                        overflow: 'hidden' 
                      }}>
                        {/* Confetti Celebration */}
                        <Confetti 
                          width={600} 
                          height={300} 
                          recycle={false} 
                          numberOfPieces={400} 
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                        />
                        
                        <h3 style={{ color: '#15803d', margin: '0 0 10px 0' }}>🎉 CÂȘTIGĂTOR OFICIAL 🎉</h3>
                        
                        <Link to={`/profile/${data.winner.username}`} style={{ 
                           display: 'inline-flex', 
                           alignItems: 'center', 
                           gap: '10px', 
                           textDecoration: 'none', 
                           color: 'black', 
                           fontWeight: 'bold', 
                           background: 'white', 
                           padding: '10px 20px', 
                           borderRadius: '50px', 
                           boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                           zIndex: 10,
                           position: 'relative'
                        }}>
                           <NImage src={data.winner.img || "/general/noAvatar.jpg"} w={50} h={50} style={{borderRadius: '50%'}} />
                           <span>@{data.winner.displayName || data.winner.username}</span>
                        </Link>
                      </div>
                    ) : (
                      // Dacă NU e gata, arătăm butoanele
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '10px' }}>
                        <button
                          onClick={handleParticipate}
                          style={{
                            background: "#e60023",
                            color: "white",
                            border: "none",
                            padding: "12px 16px",
                            borderRadius: 999,
                            fontWeight: 700,
                            cursor: "pointer",
                            flex: 1
                          }}
                        >
                          📸 Participă
                        </button>

                        {/* Buton vizibil doar pentru Owner */}
                        {isOwner && (
                          <button
                            onClick={handlePickWinner}
                            disabled={pickWinnerMutation.isPending}
                            style={{
                              background: "#333",
                              color: "white",
                              border: "none",
                              padding: "12px 16px",
                              borderRadius: 999,
                              fontWeight: 700,
                              cursor: "pointer",
                              opacity: pickWinnerMutation.isPending ? 0.7 : 1,
                              flex: 1
                            }}
                          >
                            {pickWinnerMutation.isPending ? "Se procesează..." : "🎲 Extrage Câștigător"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {data.link && (
                <a
                  className="postLink"
                  href={data.link.startsWith("http") ? data.link : `https://${data.link}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={handleLinkClick}
                >
                  Vezi produsul
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
