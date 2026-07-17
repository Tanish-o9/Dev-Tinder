import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import LoadingSpinner from "../components/LoadingSpinner";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner fullPage />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}