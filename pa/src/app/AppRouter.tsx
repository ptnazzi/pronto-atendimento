import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserLogin as UserLoginScreen } from "./components/user";
import { AdminLogin as AdminLoginScreen } from "./components/admin";
import { UserDashboard } from "./components/user";
import { AdminDashboard } from "./components/admin";
import { ConvenioForm } from "./components/admin";
import { AuthProvider } from "./context/AuthContext";
import { useParams } from "react-router-dom";

function EditConvenioPage() {
  const { id } = useParams();
  return <ConvenioForm isEdit={true} convenioId={id || ""} />;
}

function NovoConvenioPage() {
  return <ConvenioForm isEdit={false} />;
}

export default function AppRouter() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<UserLoginScreen />} />
          <Route path="/admin/login" element={<AdminLoginScreen />} />

          {/* User Routes */}
          <Route path="/dashboard" element={<UserDashboard />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/novo" element={<NovoConvenioPage />} />
          <Route path="/admin/editar/:id" element={<EditConvenioPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
