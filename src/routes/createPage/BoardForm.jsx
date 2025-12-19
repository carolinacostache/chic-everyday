import { useState, useEffect } from "react";
import NImage from "../../components/image/image";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./boardForm.css";

const BoardForm = ({ setIsNewBoardOpen, setSelectedBoard, setNewBoard, onBoardCreated }) => {
  const [title, setTitle] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  
  // --- STĂRI PENTRU COLABORATORI ---
  const [collabSearch, setCollabSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCollabs, setSelectedCollabs] = useState([]); // Userii selectați
  // --------------------------------

  const queryClient = useQueryClient();

  // 1. Căutare Live (se activează când scrii în input)
  useEffect(() => {
    const fetchUsers = async () => {
      if (collabSearch.trim().length > 1) {
        try {
          // Asigură-te că ai implementat ruta /users/search în backend!
          const res = await apiRequest.get(`/users/search?query=${collabSearch}`);
          setSearchResults(res.data);
        } catch (err) {
          console.error(err);
        }
      } else {
        setSearchResults([]);
      }
    };

    // Așteptăm 300ms după ce te oprești din scris
    const timer = setTimeout(fetchUsers, 300);
    return () => clearTimeout(timer);
  }, [collabSearch]);

  // 2. Adaugă un colaborator din listă
  const addCollaborator = (user) => {
    // Verificăm să nu fie deja adăugat
    if (!selectedCollabs.find(u => u._id === user._id)) {
      setSelectedCollabs([...selectedCollabs, user]);
    }
    setCollabSearch("");
    setSearchResults([]); // Ascundem dropdown-ul
  };

  // 3. Șterge un colaborator
  const removeCollaborator = (userId) => {
    setSelectedCollabs(selectedCollabs.filter(u => u._id !== userId));
  };

  const mutation = useMutation({
    mutationFn: (newBoardData) => apiRequest.post("/boards", newBoardData),
    onSuccess: (res) => {
      queryClient.invalidateQueries(["formBoards"]);
      queryClient.invalidateQueries(["userBoards"]);
      
      if (setSelectedBoard) setSelectedBoard(res.data._id);
      if (setNewBoard) setNewBoard(""); 
      if (onBoardCreated) {
        onBoardCreated(res.data);
      }
      setIsNewBoardOpen(false);
    },
    onError: (err) => {
      alert("Eroare: " + err.response?.data?.message);
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Extragem doar ID-urile colaboratorilor pentru a le trimite la API
    const collaboratorIds = selectedCollabs.map(u => u._id);

    mutation.mutate({
      title,
      isSecret,
      collaborators: collaboratorIds // Trimitem lista de ID-uri
    });
  };

  return (
    <div className="boardForm">
      <div className="boardFormOverlay" onClick={() => setIsNewBoardOpen(false)}></div>
      <div className="boardFormContainer">
        <div className="boardFormClose" onClick={() => setIsNewBoardOpen(false)}>
          <NImage src="/general/exit.svg" alt="Close" w={20} h={20} />
        </div>
        
        <form onSubmit={handleSubmit}>
          <h1>Create board</h1>
          
          <div className="formGroup">
            <label>Name</label>
            <input 
              type="text" 
              placeholder='Like "Places to Go" or "Recipes"' 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>

          {/* --- SECȚIUNEA COLABORATORI --- */}
          <div className="formGroup">
            <label>Collaborators</label>
            <div className="collabInputWrapper">
              <input 
                type="text" 
                placeholder="Search by username..." 
                value={collabSearch}
                onChange={(e) => setCollabSearch(e.target.value)}
              />
              
              {/* Dropdown cu Rezultate */}
              {searchResults.length > 0 && (
                <div className="collabDropdown">
                  {searchResults.map(user => (
                    <div 
                      key={user._id} 
                      className="collabResultItem"
                      onClick={() => addCollaborator(user)}
                    >
                      <img src={user.img || "/general/noAvatar.jpg"} alt="" />
                      <span>{user.username}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Lista Userilor Selectați (Chips) */}
            <div className="selectedCollabsList">
              {selectedCollabs.map(user => (
                <div key={user._id} className="collabChip">
                  <img src={user.img || "/general/noAvatar.jpg"} alt="" />
                  <span>{user.username}</span>
                  <button type="button" onClick={() => removeCollaborator(user._id)}>×</button>
                </div>
              ))}
            </div>
          </div>
          {/* ----------------------------- */}

          {/* ZONA DE SELECTARE SECRET */}
          <div className="formGroup checkboxGroup">
            <div className="checkboxLabel">
              <label htmlFor="secretBoard" style={{ fontWeight: 'bold' }}>Keep this board secret</label>
              <small>So only you and collaborators can see it.</small>
            </div>
            
            <label className="toggleSwitch">
              <input 
                type="checkbox" 
                id="secretBoard" 
                checked={isSecret}
                onChange={(e) => setIsSecret(e.target.checked)}
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button type="submit" className="createButton" disabled={!title.trim()}>
            Create
          </button>
        </form>
      </div>
    </div>
  );
};

export default BoardForm;