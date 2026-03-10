import { BrowserRouter, Routes, Route } from "react-router-dom";

import LoginPage from "@/auth/LoginPage";
import RegisterPage from "@/auth/RegisterPage";
import AcceptInvitePage from "@/onboarding/AcceptInvitePage";
import AdminDashboard from "@/dashboard/AdminDashboard";

/*
  Central router configuration
*/
export default function AppRouter(){

  return (

    <BrowserRouter>

      <Routes>
        
        <Route path="/login" element={<LoginPage />} />

        <Route path="/register" element={<RegisterPage />} />

        <Route
          path="/accept-invite/:token"
          element={<AcceptInvitePage />}
        />

        <Route
          path="/dashboard"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>

  );
}