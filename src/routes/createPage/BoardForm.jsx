import NImage from "../../components/image/image";
// Am scos 'apiRequest' de aici, nu mai este necesar

// MODIFICAT: Acum acceptă 'setSelectedBoard' pentru a goli dropdown-ul
const BoardForm = ({ setIsNewBoardOpen, setNewBoard, setSelectedBoard }) => {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = e.target[0].value.trim();
    if (!title) {
      alert("Please enter a board title");
      return;
    }
    
    // MODIFICAT: Doar setăm stările în părinte, nu mai facem apel API
    setNewBoard(title); // Setează titlul noului board (ex: "Idei de vară")
    setSelectedBoard(""); // Golește dropdown-ul (pentru a nu avea 2 selecții)
    
    setIsNewBoardOpen(false);
  };

  return (
    <div className="boardForm">
      <div className="boardFormContainer">
        <div
          className="boardFormClose"
          onClick={() => setIsNewBoardOpen(false)}
        >
          <NImage src="/general/exit.svg" alt="Închide" w={20} h={20} />
        </div>
        <form onSubmit={handleSubmit}>
          <h1>Create a new board</h1>
          <input type="text" placeholder="Board Title" />
          <button type="submit">Create</button>
        </form>
      </div>
    </div>
  );
};

export default BoardForm;