import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import apiRequest from '../../utils/apiRequest';
import BoardForm from '../../routes/createPage/BoardForm';
import useAuthStore from '../../utils/authStore';
import './save.css';


const saveToBoard = async ({ pinId, boardId }) => {
  const res = await apiRequest.post(`/pins/interact/${pinId}`, {
    type: "save",
    boardId: boardId,
  });
  return res.data;
};

const Save = ({ pinId, onClose }) => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();
  

  const [savingBoardId, setSavingBoardId] = useState(null); 
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { isPending, error, data: boards} = useQuery({
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

  const handleSave = (boardId) => {

    if (savingBoardId) return; 
    saveMutation.mutate({ pinId, boardId });
  };

  const handleCreateBoard = (newBoard) => {
    handleSave(newBoard._id);
  };

  if (isPending) return <div className="saveModalOverlay">Loading boards...</div>;
  if (error) return <div className="saveModalOverlay">Error loading boards.</div>;

  return (
    <div className="saveModalOverlay" onClick={onClose}>
      <div className="saveModalContent" onClick={(e) => e.stopPropagation()}>
        
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
                  <div className="boardThumb">
                    <img src={board.firstPin?.media || '/general/placeholder.png'} alt="" />
                    {board.isSecret && <span className="lockIcon">🔒</span>}
                  </div>
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
            <div className="createBoardToggle" onClick={() => setShowCreateForm(true)}>
              <div className="createBoardPlus">+</div>
              <span>Creează un board nou</span>
            </div>

            {showCreateForm && (
              <BoardForm 
                setIsNewBoardOpen={setShowCreateForm}
                onBoardCreated={handleCreateBoard}   
              />
            )}

      
      </div>
    </div>
  );
};

export default Save;