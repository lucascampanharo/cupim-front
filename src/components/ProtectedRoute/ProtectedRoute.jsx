import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";

import { AuthContext } from "../../context/auth-context";

function ProtectedRoute({ children, adminOnly = false }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    alert("Faça login para acessar essa página!");

    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;
