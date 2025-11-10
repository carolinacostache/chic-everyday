import useAuthStore from "../../utils/authStore";
import { Navigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (!currentUser.isAdmin) {
    return <Navigate to="/" />;
  }

  return <Outlet />;
};

export default AdminLayout;