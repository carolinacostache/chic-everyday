import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import apiRequest from "../../utils/apiRequest";
import "./participateContest.css";

const ParticipateContest = ({ pinId }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [comment, setComment] = useState("");

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error("Nu ai selectat nicio imagine.");

      const formData = new FormData();
      formData.append("image", file);
      formData.append("comment", comment);

      // IMPORTANT: backend-ul tau e app.use("/pins", pinRouter)
      // deci endpoint-ul corect este /pins/:id/participate
      const res = await apiRequest.post(`/pins/${pinId}/participate`, formData);

      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pin", pinId] });
      navigate(`/pin/${pinId}`);
    },
    onError: (err) => {
      alert(err.response?.data?.message || err.message || "Upload esuat.");
    },
  });

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      alert("Alege un fisier imagine.");
      return;
    }

    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    uploadMutation.mutate();
  };

  return (
    <div className="pcPage">
      <div className="pcModal pcModalPage">
        <div className="pcHeader">
          <h3>Participa la concurs</h3>
          <button className="pcClose" onClick={() => navigate(-1)}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="pcForm">
          <label className="pcLabel">
            Incarca poza:
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>

          {preview && (
            <div className="pcPreview">
              <img src={preview} alt="preview" />
            </div>
          )}

          <label className="pcLabel">
            Comentariu (optional):
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Scrie aici..."
            />
          </label>

          <button className="pcSubmit" type="submit" disabled={uploadMutation.isPending}>
            {uploadMutation.isPending ? "Se trimite..." : "Trimite inscrierea"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ParticipateContest;