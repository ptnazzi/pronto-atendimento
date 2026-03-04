import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

interface Props {
  onSuccess?: (user: any) => void;
}

export default function LoginScreen({ onSuccess }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (res.error) {
        setError(res.error.message);
      } else if (res.data?.user) {
        onSuccess?.(res.data.user);
      }
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white border rounded-xl p-6 max-w-md w-full"
      >
        <h2 className="text-xl font-semibold mb-2">Entrar</h2>
        <p className="text-sm text-gray-600 mb-4">Entre com seu e-mail e senha.</p>

        {error && <p className="text-sm text-red-600 mb-2">{error}</p>}

        <div className="mb-3">
          <label className="text-xs text-gray-600">E-mail</label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div className="mb-4">
          <label className="text-xs text-gray-600">Senha</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <Button type="submit" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
