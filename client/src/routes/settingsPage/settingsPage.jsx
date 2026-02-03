import { useState } from "react";
import useAuthStore from "../../utils/authStore";
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./settingsPage.css";
import { Link, useNavigate } from "react-router-dom";
import BecomeShopModal from "../../components/becomeShopModal/becomeShopModal"; 


const SettingsPage = () => {
  const { currentUser, updateUser } = useAuthStore();
  const navigate = useNavigate();
  const [openShopModal, setOpenShopModal] = useState(false); 
  const queryClient = useQueryClient();

  const DEFAULT_AVATAR = "https://ik.imagekit.io/carolina/general/noAvatar.jpg?updatedAt=1761775233364"

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(currentUser?.img || DEFAULT_AVATAR);

  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    password: "",
    newPassword: ""
  });

  const [successMsg, setSuccessMsg] = useState("");

  const [showShopModal, setShowShopModal] = useState(false);

  const updateMutation = useMutation({
    mutationFn: (data) => {
      return apiRequest.put(`/users/${currentUser._id}`, data);
    },
    onSuccess: (res) => {
      updateUser(res.data);
      setSuccessMsg("Profil actualizat cu succes!");
      updateUser(res.data);
      queryClient.invalidateQueries(["profile"]);
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: (err) => {
      console.error(err);
      alert(err.response?.data?.message || "Eroare la actualizare");
      
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        setFile(selectedFile);
        setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const dataToSend = new FormData();
    dataToSend.append("displayName", formData.displayName);
    
    // Trimitem parolele doar dacă sunt completate
    if (formData.password) dataToSend.append("password", formData.password);
    if (formData.newPassword) dataToSend.append("newPassword", formData.newPassword);
    
    // Trimitem fișierul doar dacă userul a selectat unul nou
    if (file) {
        dataToSend.append("img", file);
    }

    updateMutation.mutate(dataToSend);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="settingsPage">
      <h1>Setări Cont</h1>

      <div className="settingsContainer">
        
        <section className="settingsSection">
          <h2>Informații Profil</h2>
          <form onSubmit={handleSubmit} className="settingsForm">

            <div className="profilePicContainer">
                <img src={previewUrl} alt="Profile" className="settingsAvatar" />
                <label htmlFor="fileInput" className="changePhotoBtn">
                    📷 Schimbă Poza
                </label>
                <input 
                    type="file" 
                    id="fileInput" 
                    style={{ display: "none" }} 
                    onChange={handleFileChange}
                    accept="image/*"
                />
            </div>

            <div className="formGroup">
              <label>Username</label>
              <input 
                type="text" 
                value={currentUser?.username} 
                disabled 
                className="disabledInput" // Asigură-te că ai stilul acesta în CSS (gri, opac)
              />
              <small style={{color: "#888"}}>Username-ul nu poate fi schimbat.</small>
            </div>

            <div className="formGroup">
              <label>Email</label>
              <input type="text" value={currentUser?.email} disabled className="disabledInput" />
            </div>
            <div className="formGroup">
              <label>Nume Afișat</label>
              <input 
                type="text" 
                name="displayName" 
                value={formData.displayName} 
                onChange={handleChange} 
              />
            </div>
            <button type="submit" className="saveBtn" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? "Se salvează..." : "Salvează Modificările"}
            </button>
            {successMsg && <p className="successMessage">{successMsg}</p>}
          </form>
        </section>

        <hr />

        <section className="settingsSection">
          <h2>Schimbă Parola</h2>
          <div className="formGroup">
            <label>Parola Nouă</label>
            <input 
              type="password" 
              name="newPassword" 
              placeholder="Lasă gol dacă nu vrei să schimbi" 
              onChange={handleChange}
            />
          </div>
        </section>

        <hr />

        <section className="settingsSection shopSection">
        <h2>Cont Magazin</h2>

        {/* --- LOGICA PENTRU STATUS MAGAZIN --- */}

        {/* CAZ 1: Ești deja Magazin */}
        {currentUser.role === "SHOP" && (
          <div className="shopStatus active">
            <p>✅ Ești înregistrat ca Magazin Verificat.</p>
            <Link to="/shop/stats">
              <button className="shopDashboardBtn">Mergi la Statistici</button>
            </Link>
          </div>
        )}

        {/* CAZ 2: Ai aplicat și aștepți aprobarea (PENDING) */}
        {currentUser.role === "USER" && currentUser.shopDetails?.status === "PENDING" && (
          <div className="shopStatus pending">
            <div className="statusIcon">⏳</div>
            <div className="statusText">
              <h3>Cerere în curs de verificare</h3>
              <p>Documentele tale au fost trimise și sunt analizate de echipa noastră. Vei primi o notificare când statusul se schimbă.</p>
            </div>
          </div>
        )}

        {/* CAZ 3: Cererea a fost respinsă (REJECTED) */}
        {currentUser.role === "USER" && currentUser.shopDetails?.status === "REJECTED" && (
          <div className="shopStatus rejected">
            <div className="statusIcon">❌</div>
            <div className="statusText">
              <h3>Cerere Respinsă</h3>
              <p>Din păcate, documentele tale nu au fost aprobate. Te rugăm să verifici condițiile și să aplici din nou.</p>
              <button className="retryBtn" onClick={() => setOpenShopModal(true)}>
                Aplică din nou
              </button>
            </div>
          </div>
        )}

        {/* CAZ 4: Nu ești magazin și nici nu aștepți (Poți aplica) */}
        {currentUser.role === "USER" && 
        (!currentUser.shopDetails || currentUser.shopDetails.status === "NONE") && (
          <div className="shopSection">
            <p>Transformă-ți contul în Magazin Verificat și accesează funcții premium.</p>
            <ul>
              <li>📈 Statistici avansate</li>
              <li>🏷️ Etichetare produse</li>
              <li>✅ Insignă pe profil</li>
            </ul>
            <button className="upgradeBtn" onClick={() => setOpenShopModal(true)}>
              Devino Magazin Verificat
            </button>
          </div>
        )}
        </section>

        {openShopModal && (
        <BecomeShopModal onClose={() => setOpenShopModal(false)} />
        )}

      </div>
    </div>
  );
};

export default SettingsPage;