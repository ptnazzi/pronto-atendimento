import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../../../lib/firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { setDoc, doc } from "firebase/firestore";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { AlertCircle } from "lucide-react";

export default function UserLoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          role: "user",
          createdAt: new Date(),
        });

        navigate("/dashboard");
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("Usuário não encontrado");
      } else if (err.code === "auth/wrong-password") {
        setError("Senha incorreta");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Email já cadastrado");
      } else if (err.code === "auth/weak-password") {
        setError("Senha muito fraca (mínimo 6 caracteres)");
      } else {
        setError(err?.message ?? String(err));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-8 max-w-md w-full shadow-lg"
      >
        <h2 className="text-2xl font-semibold mb-2">
          {isSignUp ? "Criar Conta" : "Acesso de Usuário"}
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          {isSignUp
            ? "Crie uma nova conta para acessar"
            : "Visualize e gerencie seus convênios"}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 block mb-1">
            E-mail
          </label>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
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

        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Processando..." : isSignUp ? "Criar Conta" : "Entrar"}
        </Button>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            {isSignUp ? "Já tem conta? " : "Não tem conta? "}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setError(null);
                setIsSignUp(!isSignUp);
              }}
              className="text-blue-600"
            >
              {isSignUp ? "Entrar" : "Criar"}
            </Button>
          </p>
        </div>

        <div className="mt-4 text-center border-t pt-4">
          <p className="text-sm text-gray-600">
            É administrador?{" "}
            <Button
              type="button"
              variant="link"
              onClick={() => {
                setError(null);
                navigate("/admin/login");
              }}
              className="text-blue-600"
            >
              Clique aqui
            </Button>
          </p>
        </div>
      </form>
    </div>
  );
}
