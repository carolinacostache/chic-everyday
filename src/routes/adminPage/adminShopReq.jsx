import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminShopReq.css"; // Vom crea stilurile

const AdminShopRequestsPage = () => {
  const queryClient = useQueryClient();

  // 1. Luăm toți userii
  const { data: users, isLoading } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => apiRequest.get("/admin/users").then((res) => res.data),
  });

  // 2. Filtrăm doar pe cei care sunt PENDING
  const pendingRequests = users?.filter(u => u.shopDetails?.status === "PENDING") || [];

  // 3. Mutații pentru butoane
  const approveMutation = useMutation({
    mutationFn: (id) => apiRequest.put(`/admin/shops/approve/${id}`),
    onSuccess: () => {
      alert("Magazin Aprobat!");
      queryClient.invalidateQueries(["adminUsers"]);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => apiRequest.put(`/admin/shops/reject/${id}`),
    onSuccess: () => {
      alert("Cerere Respinsă.");
      queryClient.invalidateQueries(["adminUsers"]);
    }
  });

  if (isLoading) return <div>Se încarcă cererile...</div>;

  return (
    <div className="adminPage">
      <h1>Cereri de Magazin în Așteptare</h1>
      
      {pendingRequests.length === 0 ? (
        <p>Nu există cereri noi momentan.</p>
      ) : (
        <div className="requestsList">
          {pendingRequests.map(user => (
            <div key={user._id} className="requestCard">
              <div className="requestHeader">
                <h3>{user.displayName} <span className="username">(@{user.username})</span></h3>
                <span className="email">{user.email}</span>
              </div>
              
              <div className="requestDetails">
                <p><strong>Website:</strong> {user.shopDetails?.website || "N/A"}</p>
                <p><strong>Document:</strong></p>
                <div className="docPreview">
                  {/* Link către documentul încărcat */}
                  <a href={user.shopDetails?.verificationDocument} target="_blank" rel="noreferrer">
                    Vezi Documentul (Click Aici)
                  </a>
                  <img src={user.shopDetails?.verificationDocument} alt="Previzualizare" className="docImg" />
                </div>
              </div>

              <div className="requestActions">
                <button 
                  className="rejectBtn"
                  onClick={() => rejectMutation.mutate(user._id)}
                  disabled={rejectMutation.isPending}
                >
                  Respinge
                </button>
                <button 
                  className="approveBtn" 
                  onClick={() => approveMutation.mutate(user._id)}
                  disabled={approveMutation.isPending}
                >
                  Aprobă Magazin
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminShopRequestsPage;