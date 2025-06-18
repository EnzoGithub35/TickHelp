import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ReactNode } from "react";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRoles = [],
  redirectPath = "/login",
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // If roles are specified and user doesn't have the required role
  if (requiredRoles.length > 0 && user && !requiredRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
