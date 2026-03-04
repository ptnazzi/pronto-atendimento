import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../lib/firebaseClient";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { AlertCircle } from "lucide-react";

export default function AdminLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check if user has admin role in Firestore
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (!userDoc.exists() || userDoc.data().role !== "admin") {
        setError("Você não tem permissão de admin");
        return;
      }

      navigate("/admin/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Email ou senha incorretos");
      } else if (err.code === "auth/wrong-password") {
        setError("Email ou senha incorretos");
      } else {
        setError(err?.message ?? String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-red-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border-2 border-red-200 rounded-xl p-8 max-w-md w-full shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-2 text-red-700">
          Acesso Administrativo
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Gerenciar convênios e configurações
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            E-mail de Admin
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@email.com"
            required
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            Senha
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>

        <Button type="submit" disabled={loading} className="w-full bg-red-600 hover:bg-red-700">
          {loading ? "Verificando..." : "Entrar como Admin"}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Usuário comum?{" "}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setError(null);
                navigate("/");
              }}
              className="text-blue-600"
            >
              Volte aqui
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}
