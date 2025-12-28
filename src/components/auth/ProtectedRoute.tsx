import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  children: JSX.Element;
  allowedRoles?: string[];
};

export default function ProtectedRoute({
  children,
  allowedRoles,
}: Props) {
  const { user, userProfile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for userProfile to load before checking roles
  if (!userProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-semibold">Loading profile...</p>
      </div>
    );
  }

  if (allowedRoles && userProfile.role && !allowedRoles.includes(userProfile.role)) {
    return <Navigate to="/rejected" replace />;
  }

  return children;
}
