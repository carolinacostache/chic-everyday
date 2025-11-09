import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import useAuthStore from '../../utils/authStore';
import './save.css';


const saveToBoard = async ({ pinId, boardId }) => {
  const res = await apiRequest.post(`/pins/interact/${pinId}`, {
    type: "save",
    boardId: boardId,
  });
  return res.data;
};


const createBoard = async (title) => {
  const res = await apiRequest.post("/boards", { title });
  return res.data;
};

const Save = ({ pinId, onClose }) => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  

  const [savingBoardId, setSavingBoardId] = useState(null); 
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");

  const { isPending, error, data: boards, refetch: refetchBoards } = useQuery({
    queryKey: ['userBoards', currentUser._id, pinId],
    queryFn: () =>
      apiRequest.get(`/boards/${currentUser._id}?pinId=${pinId}`).then((res) => res.data),
    enabled: !!currentUser._id,
  });


  const saveMutation = useMutation({
    mutationFn: saveToBoard,

    onMutate: (variables) => {
      setSavingBoardId(variables.boardId); 
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['interactionCheck', pinId] });
      queryClient.invalidateQueries({ queryKey: ['userBoards', currentUser._id, pinId] });
      return { savedBoardId: variables.boardId }; 
    },
    onError: (err) => {
      const message = err.response?.data?.message || "A apărut o eroare.";
      if (message.includes("Pin-ul este deja salvat pe acest board")) {
         alert("Pin-ul este deja salvat pe acest board!");
      } else {
         alert(message);
      }
    },
    onSettled: (data) => {
      setSavingBoardId(null);
    },
  });


  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onMutate: () => {
      setSavingBoardId("__CREATING__"); 
    },
    onSuccess: (newBoard) => {
      saveMutation.mutate({ pinId, boardId: newBoard._id });
      refetchBoards();
      setShowCreateForm(false);
      setNewBoardTitle(""); 
    },
    onError: (err) => {
      alert("Eroare la crearea board-ului: " + err.response?.data?.message);
    },

    onSettled: () => {
        if (savingBoardId === "__CREATING__") {
            setSavingBoardId(null);
        }
    }
  });

  const handleSave = (boardId) => {

    if (savingBoardId) return; 
    saveMutation.mutate({ pinId, boardId });
  };

  const handleCreateBoard = (e) => {
    e.preventDefault();
    if (newBoardTitle.trim() === "" || savingBoardId) return;
    createBoardMutation.mutate(newBoardTitle);
  };

  if (isPending) return <div className="saveModalOverlay">Loading boards...</div>;
  if (error) return <div className="saveModalOverlay">Error loading boards.</div>;

  return (
    <div className="saveModalOverlay" onClick={onClose}>
      <div className="saveModalContent" onClick={(e) => e.stopPropagation()}>
        
        {!showCreateForm && (
          <>
            <div className="saveModalHeader">
              <h1>Salvează pe un board</h1>
              <button className="closeButton" onClick={onClose}>X</button>
            </div>
            <div className="boardList">
              {boards.map((board) => (
                <div
                  key={board._id}
                  className="boardItem"
                  onClick={() => board.isSaved ? null : handleSave(board._id)}
                >
                  <img
                    src={board.firstPin?.media || '/general/placeholder.png'}
                    alt={board.title}
                  />
                  <span>{board.title}</span>
                  <button
                    className={`saveButtonModal ${board.isSaved ? 'saved' : ''}`}

                    disabled={savingBoardId !== null|| board.isSaved}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSave(board._id);
                    }}
                  >
                    {board.isSaved 
                      ? "Salvat" 
                      : (savingBoardId === board._id ? "Se salvează..." : "Salvează")
                    }
                  </button>
                </div>
              ))}
            </div>
            <div className="createBoardToggle" onClick={() => savingBoardId ? null : setShowCreateForm(true)}>
              <div className="createBoardPlus">+</div>
              <span>Creează un board nou</span>
            </div>
          </>
        )}

        {showCreateForm && (
          <div className="createBoardForm">
            <div className="saveModalHeader">
              <h1>Creează board</h1>
              <button className="backButton" onClick={() => setShowCreateForm(false)}>&lt;</button>
            </div>
            <form onSubmit={handleCreateBoard}>
              <label htmlFor="boardTitle">Nume</label>
              <input 
                type="text" 
                id="boardTitle"
                placeholder="Ex: 'Idei de călătorie'"
                value={newBoardTitle}
                onChange={(e) => setNewBoardTitle(e.target.value)}
              />
              <button 
                type="submit" 
                className="createButton"

                disabled={savingBoardId !== null} 
              >
                {savingBoardId === "__CREATING__" ? "Se creează..." : "Creează"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Save;