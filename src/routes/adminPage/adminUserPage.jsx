import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminUserPage.css";
import { Link } from "react-router-dom";

const AdminUserPage = () => {
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

  const pendingCount = users?.filter(u => u.shopDetails?.status === "PENDING").length || 0;

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

      {pendingCount > 0 && (
        <div style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeeba",
          color: "#856404",
          padding: "15px",
          borderRadius: "8px",
          marginBottom: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚠️ Aveți <strong>{pendingCount}</strong> cereri de magazin în așteptare.</span>
          <Link 
            to="/admin/requests" 
            style={{ fontWeight: "bold", color: "#856404", textDecoration: "underline" }}
          >
            Vezi Cererile &rarr;
          </Link>
        </div>
      )}

      <div className="adminUserList">
        <table>
          <thead>
            <tr>
              <th>Imagine</th>
              <th>Username</th>
              <th>Email</th>
              <th>Rol</th>
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
                <td>{user.role}</td>
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

export default AdminUserPage;