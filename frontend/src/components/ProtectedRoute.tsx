import { Navigate } from "react-router-dom";

/*
  Protect dashboard routes.

  If user is not logged in → redirect to login.
*/

export default function ProtectedRoute({ children }: any) {

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}