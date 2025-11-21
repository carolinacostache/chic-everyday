import useAuthStore from "../../utils/authStore";
import AdminBar from "../../components/adminBar/adminBar";
import { Navigate, Outlet } from "react-router-dom";

const AdminLayout = () => {
  const { currentUser } = useAuthStore();

  if (!currentUser) {
    return <Navigate to="/auth" />;
  }
  
  if (!currentUser.isAdmin) {
    return <Navigate to="/" />;
  }

  return (
    <div className="adminLayout">
      <AdminBar />
      
      <div className="adminContent">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout;