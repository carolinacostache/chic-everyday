import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminPage.css";

const AdminPage = () => {
  const queryClient = useQueryClient();

  const { isPending, error, data: users } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => apiRequest.get("/admin/users").then((res) => res.data),
  });

  const deleteUserMutation = useMutation({
    mutationFn: (userId) => apiRequest.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
  });

  const handleDeleteUser = (userId) => {
    if (window.confirm("Ești sigur că vrei să ștergi acest utilizator?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.response.data.message}</div>;

  return (
    <div className="adminPage">
      <h1>Admin Panel - User Management</h1>
      <div className="adminUserList">
        <table>
          <thead>
            <tr>
              <th>Imagine</th>
              <th>Username</th>
              <th>Email</th>
              <th>Admin?</th>
              <th>Acțiuni</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>
                  <img 
                    src={user.img || "/general/noAvatar.jpg"} 
                    alt={user.username} 
                  />
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.isAdmin ? "Da" : "Nu"}</td>
                <td>
                  <button 
                    className="deleteButton"
                    onClick={() => handleDeleteUser(user._id)}
                    disabled={deleteUserMutation.isPending}
                  >
                    Șterge
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPage;