import NImage from "../../components/image/image";

const BoardForm = ({ setIsNewBoardOpen, setNewBoard, setSelectedBoard }) => {
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const title = e.target[0].value.trim();
    if (!title) {
      alert("Please enter a board title");
      return;
    }
    
    setNewBoard(title); 
    setSelectedBoard(""); 
    
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