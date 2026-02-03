import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminUserPage.css";
import { Link, useSearchParams } from "react-router-dom";

const AdminUserPage = () => {
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  // 1. Fetch Users
  const { isPending, error, data: users } = useQuery({
    queryKey: ["adminUsers", search],
    queryFn: () => apiRequest.get(`/admin/users?search=${search}`).then((res) => res.data),
  });

  // 2. Mutație BAN (Aceasta înlocuiește DELETE)
  // Ruta backend este acum: router.put("/user/:id/ban", ...)
  const banUserMutation = useMutation({
    mutationFn: ({ userId, reason }) => 
      apiRequest.put(`/admin/user/${userId}/ban`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      alert("Utilizator Banat cu succes!");
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Eroare la banare!");
    }
  });

  // 3. Mutație Schimbare Rol
  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, newRole }) => 
      apiRequest.put(`/admin/users/${userId}`, { role: newRole }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Eroare la actualizarea rolului!");
    }
  });

  const pendingCount = users?.filter(u => u.shopDetails?.status === "PENDING").length || 0;

  // 4. Handler BAN (cere motivul)
  const handleBanUser = (userId) => {
    const reason = window.prompt("Introduceți motivul banării:", "Încălcarea termenilor");
    
    if (reason) {
      // Trimitem ID-ul și Motivul către backend
      banUserMutation.mutate({ userId, reason });
    }
  };

  const handleRoleChange = (userId, newRole) => {
    if (window.confirm(`Ești sigur că vrei să schimbi rolul în ${newRole}?`)) {
      updateRoleMutation.mutate({ userId, newRole });
    }
  };

  if (isPending) return <div>Loading...</div>;
  if (error) return <div>Error: {error.response?.data?.message || "Error fetching users"}</div>;

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
                    style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                  />
                </td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <select 
                    value={user.role}
                    onChange={(e) => handleRoleChange(user._id, e.target.value)}
                    className={`roleSelect ${user.role.toLowerCase()}`}
                    disabled={updateRoleMutation.isPending}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                    <option value="SHOP">SHOP</option>
                    <option value="BANNED">BANNED</option>
                  </select>
                </td>
                <td>
                  {/* Ascundem butonul dacă e deja banat sau e admin */}
                  {user.role !== "BANNED" && user.role !== "ADMIN" && (
                    <button 
                      className="deleteButton"
                      onClick={() => handleBanUser(user._id)}
                      disabled={banUserMutation.isPending}
                      style={{ backgroundColor: "#d32f2f", color: "white" }}
                    >
                      BAN 🚫
                    </button>
                  )}
                  {user.role === "BANNED" && (
                     <span style={{ color: "red", fontWeight: "bold" }}>BANAT</span>
                  )}
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