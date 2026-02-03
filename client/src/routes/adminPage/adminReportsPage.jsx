import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiRequest from "../../utils/apiRequest";
import "./adminReportsPage.css";

const AdminReportsPage = () => {
  const queryClient = useQueryClient();

  const { data: reports, isLoading } = useQuery({
    queryKey: ["adminReports"],
    queryFn: () => apiRequest.get("/admin/reports").then((res) => res.data),
  });

  const resolveMutation = useMutation({
    mutationFn: (id) => apiRequest.put(`/admin/reports/${id}/resolve`),
    onSuccess: () => queryClient.invalidateQueries(["adminReports"]),
  });

  const deletePinMutation = useMutation({
  mutationFn: (pinId) => apiRequest.delete(`/admin/pins/${pinId}`),
  onSuccess: () => {
    alert("Pin-ul a fost șters!");
    queryClient.invalidateQueries(["adminReports"]);
  }
});

  if (isLoading) return <div>Se încarcă rapoartele...</div>;

  return (
    <div className="adminReports">
      <h1>🚩 Raportări de la Utilizatori</h1>
      <div className="reportsGrid">
        {reports?.map((report) => (
          <div key={report._id} className="reportCard">
            <div className="reportHeader">
              <span>De la: <strong>@{report.reporter?.username}</strong></span>
              <span className="reportDate">{new Date(report.createdAt).toLocaleDateString()}</span>
            </div>
            
            <div className="reportTarget">
              <p><strong>Motiv:</strong> {report.reason}</p>
              {report.targetData && (
                <div className="targetPreview">
                  <img src={report.targetData.media} alt="Target" />
                  <span>{report.targetData.title}</span>
                </div>
              )}
            </div>

            <div className="reportActions">
  <button 
    onClick={() => window.open(`/pin/${report.targetId}`, '_blank')}
    className="viewBtn"
  >
    👀 Vezi
  </button>
  
  {/* Butonul de Ștergere Directă */}
  <button 
    onClick={() => {
      if(window.confirm("Ștergi definitiv acest Pin?")) {
        deletePinMutation.mutate(report.targetId);
        resolveMutation.mutate(report._id); // Îl și rezolvăm automat
      }
    }}
    className="deleteBtn"
    style={{ background: "#d32f2f", color: "white" }}
  >
    🗑️ Șterge Pin
  </button>

  <button 
    onClick={() => resolveMutation.mutate(report._id)}
    className="resolveBtn"
  >
    ✅ Ignoră
  </button>
</div>
          </div>
        ))}
        {reports?.length === 0 && <p>Nu există raportări noi. Totul e curat! ✨</p>}
      </div>
    </div>
  );
};

export default AdminReportsPage;