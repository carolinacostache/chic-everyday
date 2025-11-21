import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminBoardPage.css";

const AdminBoardsPage = () => {
  const queryClient = useQueryClient();

  const { isPending, error, data: boards } = useQuery({
    queryKey: ["adminBoards"],
    queryFn: () => apiRequest.get("/admin/boards").then((res) => res.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (boardId) => apiRequest.delete(`/admin/boards/${boardId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBoards"] });
    },
    onError: (err) => alert(err.response?.data?.message),
  });

  const handleDelete = (boardId) => {
    if (window.confirm("Sigur vrei să ștergi acest board și toate salvările din el?")) {
      deleteMutation.mutate(boardId);
    }
  };

  if (isPending) return <div className="loadingMsg">Se încarcă board-urile...</div>;
  if (error) return <div className="errorMsg">Eroare la încărcare.</div>;

  return (
    <div className="adminPage boardsPage">
      <h1>Moderare Boards (Colecții)</h1>
      <p className="subtitle">Gestionează colecțiile create de utilizatori.</p>
      
      <div className="adminBoardsContainer">
        <table>
          <thead>
            <tr>
              <th>Titlu Board</th>
              <th>Proprietar</th>
              <th>ID Board</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {boards.map((board) => (
              <tr key={board._id}>
                <td className="boardTitleCell">
                  <strong>{board.title}</strong>
                </td>
                <td>
                  <div className="ownerInfo">
                    <img 
                      src={board.user?.img || "/general/noAvatar.jpg"} 
                      alt="" 
                    />
                    <span>{board.user?.username || "Unknown"}</span>
                  </div>
                </td>
                <td className="idCell">
                  {board._id}
                </td>
                <td>
                  <button 
                    className="deleteBoardBtn"
                    onClick={() => handleDelete(board._id)}
                    disabled={deleteMutation.isPending}
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
            {boards.length === 0 && (
              <tr>
                <td colSpan="4" style={{ textAlign: "center", padding: "20px" }}>
                  Nu există board-uri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminBoardsPage;