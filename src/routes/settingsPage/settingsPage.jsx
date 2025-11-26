import { useState } from "react";
import useAuthStore from "../../utils/authStore";
import apiRequest from "../../utils/apiRequest";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import "./settingsPage.css";
import BecomeShopModal from "../../components/becomeShopModal/becomeShopModal";

const SettingsPage = () => {
  const { currentUser, updateUser } = useAuthStore(); // Presupunem că ai updateUser în store, dacă nu, folosim doar currentUser
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    displayName: currentUser?.displayName || "",
    password: "",
    newPassword: ""
  });

  const [successMsg, setSuccessMsg] = useState("");

  const [showShopModal, setShowShopModal] = useState(false);

  // Mutație pentru actualizarea profilului (Nume, Parolă)
  const updateMutation = useMutation({
    mutationFn: (data) => apiRequest.put(`/users/${currentUser._id}`, data),
    onSuccess: (res) => {
      setSuccessMsg("Profil actualizat cu succes!");
      queryClient.invalidateQueries(["profile", currentUser.username]);
      // Aici ar trebui să actualizăm și useAuthStore dacă se schimbă numele
      setTimeout(() => setSuccessMsg(""), 3000);
    },
    onError: (err) => {
      alert(err.response?.data?.message || "Eroare la actualizare");
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="settingsPage">
      <h1>Setări Cont</h1>

      <div className="settingsContainer">
        
        {/* --- SECȚIUNEA 1: Profil General --- */}
        <section className="settingsSection">
          <h2>Informații Profil</h2>
          <form onSubmit={handleSubmit} className="settingsForm">
            <div className="formGroup">
              <label>Username (nu se poate schimba)</label>
              <input type="text" value={currentUser?.username} disabled className="disabledInput" />
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

        {/* --- SECȚIUNEA 2: Securitate (Opțional) --- */}
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

        {/* În interiorul return, în Shop Section */}
        <section className="settingsSection shopSection">
        <h2>Cont Magazin</h2>

        {/* CAZUL 1: Este deja Magazin */}
        {currentUser?.role === "SHOP" ? (
            <div className="shopStatus active">
            <p>✅ Ești înregistrat ca Magazin Verificat.</p>
            <button className="shopDashboardBtn">Mergi la Statistici</button>
            </div>
        ) : 
        /* CAZUL 2: A aplicat deja și așteaptă */
        currentUser?.shopDetails?.status === "PENDING" ? (
            <div className="shopStatus pending" style={{backgroundColor: "#fff3cd", padding: "15px", borderRadius: "8px"}}>
            <p>🕒 Aplicația ta este în curs de revizuire.</p>
            <small>Un administrator va verifica documentele în curând.</small>
            </div>
        ) : (
            /* CAZUL 3: Utilizator normal */
            <div className="shopStatus upgrade">
            <p>Reprezinți un brand? Transformă-ți contul...</p>
            {/* ... lista beneficii ... */}

            {/* Butonul care deschide modalul */}
            <button className="upgradeBtn" onClick={() => setShowShopModal(true)}>
                Aplică pentru Magazin
            </button>
            </div>
        )}
        </section>

        {/* Afișează modalul dacă este deschis */}
        {showShopModal && (
        <BecomeShopModal onClose={() => setShowShopModal(false)} />
        )}

      </div>
    </div>
  );
};

export default SettingsPage;