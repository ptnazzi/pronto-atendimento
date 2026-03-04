import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db } from "../../lib/firebaseClient";
import { setDoc, doc, getDoc } from "firebase/firestore";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";
import { ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ConvenioForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = !!id;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    nome_convenio: "",
    cnpj: "",
    status: "credenciamento" as "ativo" | "suspenso" | "credenciamento",
    telefone: "",
    email: "",
    usuario_portal: "",
    senha_portal: "",
    prazo_autorizacao: "",
    contato_comercial: "",
    contato_autorizacao: "",
    observacoes: "",
    link_portal: "",
  });

  const [tiposAtendimento, setTiposAtendimento] = useState<string[]>([]);
  const [documentos, setDocumentos] = useState<string[]>([]);
  const [regras, setRegras] = useState<string[]>([]);
  const [novoTipo, setNovoTipo] = useState("");
  const [novoDoc, setNovoDoc] = useState("");
  const [novaRegra, setNovaRegra] = useState("");

  useEffect(() => {
    if (isEdit && id) {
      loadConvenio();
    }
  }, [id, isEdit]);

  async function loadConvenio() {
    try {
      const docSnap = await getDoc(doc(db, "convenios", id!));
      if (docSnap.exists()) {
        const data = docSnap.data();
        setForm({
          nome_convenio: data.nome_convenio,
          cnpj: data.cnpj,
          status: data.status,
          telefone: data.telefone,
          email: data.email,
          usuario_portal: data.usuario_portal || "",
          senha_portal: data.senha_portal || "",
          prazo_autorizacao: data.prazo_autorizacao,
          contato_comercial: data.contato_comercial || "",
          contato_autorizacao: data.contato_autorizacao || "",
          observacoes: data.observacoes || "",
          link_portal: data.link_portal || "",
        });
        setTiposAtendimento(data.tipos_atendimento || []);
        setDocumentos(data.documentos_necessarios || []);
        setRegras(data.regras || []);
      }
    } catch (err) {
      console.error("Erro ao carregar convênio:", err);
      setError("Erro ao carregar dados do convênio");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = {
        ...form,
        tipos_atendimento: tiposAtendimento,
        documentos_necessarios: documentos,
        regras,
      };

      if (isEdit && id) {
        await setDoc(doc(db, "convenios", id), data, { merge: true });
      } else {
        await setDoc(doc(db, "convenios"), data);
      }

      setSuccess(true);
      setTimeout(() => {
        navigate("/admin/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  const addItem = (
    item: string,
    list: string[],
    setList: (list: string[]) => void,
    setter: (val: string) => void
  ) => {
    if (item.trim()) {
      setList([...list, item]);
      setter("");
    }
  };

  const removeItem = (
    index: number,
    list: string[],
    setList: (list: string[]) => void
  ) => {
    setList(list.filter((_, i) => i !== index));
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-white to-green-50">
        <div className="text-center">
          <CheckCircle2 className="size-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold mb-2">
            {isEdit ? "Convênio atualizado!" : "Convênio adicionado!"}
          </h2>
          <p className="text-gray-600">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/admin/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="size-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-4xl font-bold mb-2">
            {isEdit ? "Editar" : "Adicionar"} Convênio
          </h1>
          <p className="text-gray-600">
            {isEdit
              ? "Atualize as informações do convênio"
              : "Preencha os dados do novo convênio"}
          </p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
            <AlertCircle className="size-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações Básicas */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Nome do Convênio *
                </label>
                <Input
                  value={form.nome_convenio}
                  onChange={(e) =>
                    setForm({ ...form, nome_convenio: e.target.value })
                  }
                  placeholder="Ex: Unimed"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  CNPJ *
                </label>
                <Input
                  value={form.cnpj}
                  onChange={(e) => setForm({ ...form, cnpj: e.target.value })}
                  placeholder="00.000.000/0000-00"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">Status</label>
                <select
                  value={form.status}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      status: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ativo">Ativo</option>
                  <option value="credenciamento">Credenciamento</option>
                  <option value="suspenso">Suspenso</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Prazo de Autorização
                </label>
                <Input
                  value={form.prazo_autorizacao}
                  onChange={(e) =>
                    setForm({ ...form, prazo_autorizacao: e.target.value })
                  }
                  placeholder="Ex: 24 horas"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Contatos */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Contatos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Telefone *
                </label>
                <Input
                  value={form.telefone}
                  onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                  placeholder="(00) 00000-0000"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  E-mail *
                </label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="contato@convenio.com"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Contato Comercial
                </label>
                <Input
                  value={form.contato_comercial}
                  onChange={(e) =>
                    setForm({ ...form, contato_comercial: e.target.value })
                  }
                  placeholder="Nome e telefone"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Contato para Autorização
                </label>
                <Input
                  value={form.contato_autorizacao}
                  onChange={(e) =>
                    setForm({ ...form, contato_autorizacao: e.target.value })
                  }
                  placeholder="Nome e telefone"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Portal */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Acesso ao Portal</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">
                  Usuário Portal
                </label>
                <Input
                  value={form.usuario_portal}
                  onChange={(e) =>
                    setForm({ ...form, usuario_portal: e.target.value })
                  }
                  placeholder="usuario"
                />
              </div>

              <div>
                <label className="text-sm font-medium block mb-1">
                  Senha Portal
                </label>
                <Input
                  type="password"
                  value={form.senha_portal}
                  onChange={(e) =>
                    setForm({ ...form, senha_portal: e.target.value })
                  }
                  placeholder="••••••••"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-sm font-medium block mb-1">
                  Link do Portal
                </label>
                <Input
                  type="url"
                  value={form.link_portal}
                  onChange={(e) =>
                    setForm({ ...form, link_portal: e.target.value })
                  }
                  placeholder="https://portal.convenio.com"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Tipos de Atendimento */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Tipos de Atendimento</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={novoTipo}
                onChange={(e) => setNovoTipo(e.target.value)}
                placeholder="Ex: Cirurgias"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(novoTipo, tiposAtendimento, setTiposAtendimento, setNovoTipo);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addItem(novoTipo, tiposAtendimento, setTiposAtendimento, setNovoTipo)
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tiposAtendimento.map((tipo, index) => (
                <div
                  key={index}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                >
                  {tipo}
                  <button
                    type="button"
                    onClick={() =>
                      removeItem(index, tiposAtendimento, setTiposAtendimento)
                    }
                    className="hover:text-blue-900"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Documentos */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Documentos Necessários</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={novoDoc}
                onChange={(e) => setNovoDoc(e.target.value)}
                placeholder="Ex: RG + CPF"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(novoDoc, documentos, setDocumentos, setNovoDoc);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addItem(novoDoc, documentos, setDocumentos, setNovoDoc)
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {documentos.map((doc, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{doc}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index, documentos, setDocumentos)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Regras */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Regras e Procedimentos</h2>
            <div className="flex gap-2 mb-4">
              <Input
                value={novaRegra}
                onChange={(e) => setNovaRegra(e.target.value)}
                placeholder="Ex: Autorização prévia obrigatória"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addItem(novaRegra, regras, setRegras, setNovaRegra);
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  addItem(novaRegra, regras, setRegras, setNovaRegra)
                }
              >
                Adicionar
              </Button>
            </div>
            <div className="space-y-2">
              {regras.map((regra, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                  <span>{regra}</span>
                  <button
                    type="button"
                    onClick={() => removeItem(index, regras, setRegras)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Observações */}
          <div className="bg-white rounded-xl p-6 border">
            <h2 className="text-lg font-semibold mb-4">Observações</h2>
            <textarea
              value={form.observacoes}
              onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              placeholder="Notas adicionais sobre o convênio..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/dashboard")}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading
                ? "Salvando..."
                : isEdit
                ? "Atualizar Convênio"
                : "Criar Convênio"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
