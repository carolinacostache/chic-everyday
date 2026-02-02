import { useState, useContext } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AuthContext } from "../../context/AuthContext";
import apiRequest from "../../utils/apiRequest";
import "./becomeShopModal.css";

const BecomeShopModal = ({ onClose }) => {
  const queryClient = useQueryClient();
  const { updateUser } = useContext(AuthContext);
  const [website, setWebsite] = useState("");
  const [file, setFile] = useState(null);

  const mutation = useMutation({
    mutationFn: (formData) => apiRequest.post("/users/apply-shop", formData),
    onSuccess: () => {
      updateUser(res.data);
      alert("Aplicația ta a fost trimisă! Un administrator o va revizui curând.");
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.message || "A apărut o eroare.");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) {
      alert("Te rog încarcă documentul doveditor.");
      return;
    }

    const formData = new FormData();
    formData.append("website", website);
    formData.append("document", file);

    mutation.mutate(formData);
  };

  return (
    <div className="modalOverlay" onClick={onClose}>
      <div className="modalContent" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <h2>Aplică pentru Cont Magazin</h2>
          <button className="closeBtn" onClick={onClose}>X</button>
        </div>

        <div className="modalBody">
          <p className="infoText">
            Pentru a deveni un Magazin verificat pe ChicEveryday, avem nevoie de o dovadă a activității tale comerciale (ex: Certificat de Înregistrare, CUI).
          </p>

          <form onSubmit={handleSubmit}>
            <div className="formGroup">
              <label>Website Magazin (Opțional)</label>
              <input 
                type="text" 
                placeholder="https://magazinul-tau.ro"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="formGroup">
              <label>Document Doveditor (PDF, JPG, PNG)</label>
              <input 
                type="file" 
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setFile(e.target.files[0])}
                required
              />
            </div>

            <button 
              type="submit" 
              className="submitBtn" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Se trimite..." : "Trimite Aplicația"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BecomeShopModal;