import useAuthStore from "../../utils/authStore";
import { Navigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const { currentUser } = useAuthStore();

  // Verifică dacă user-ul este logat ȘI dacă este admin
  if (!currentUser) {
    // Dacă nu e logat, trimite la pagina de autentificare
    return <Navigate to="/auth" />;
  }
  
  if (!currentUser.isAdmin) {
    // Dacă e logat, dar NU e admin, trimite la pagina principală
    return <Navigate to="/" />;
  }

  // Dacă e logat ȘI e admin, permite accesul la paginile de admin
  return <Outlet />;
};

export default AdminLayout;