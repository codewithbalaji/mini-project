import { Route, Routes } from "react-router"
import Index from "./pages/Index"
import Onboarding from "./pages/auth/Onboarding"
import Login from "./pages/auth/Login"
import Register from "./pages/auth/Register"

const App = () => {
  return (
    <Routes>
       <Route index element={<Index />} />
       <Route path="/auth/onboarding" element={<Onboarding />} />
       <Route path="/auth/login" element={<Login />} />
       <Route path="/auth/register" element={<Register />} />
    </Routes>
  )
}

export default App