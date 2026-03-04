import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../../lib/firebaseClient";
import { collection, getDocs, deleteDoc, doc, query, orderBy, addDoc } from "firebase/firestore";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  Plus,
  Edit2,
  Trash2,
  LogOut,
  Search,
  Building2,
} from "lucide-react";
import { DataItem } from "../shared/DataCard";
import { STATUS_COLORS, STATUS_LABELS } from "../../constants";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadConvenios();
  }, []);

  async function loadConvenios() {
    try {
      const q = query(collection(db, "convenios"), orderBy("nome_convenio", "asc"));
      const querySnapshot = await getDocs(q);

      const mapped: DataItem[] = querySnapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          nomeConvenio: data.nome_convenio,
          cnpj: data.cnpj,
          status: data.status,
          telefone: data.telefone,
          email: data.email,
          usuarioPortal: data.usuario_portal,
          senhaPortal: data.senha_portal,
          tiposAtendimento: data.tipos_atendimento || [],
          prazoAutorizacao: data.prazo_autorizacao,
          documentosNecessarios: data.documentos_necessarios || [],
          regras: data.regras || [],
          contatoComercial: data.contato_comercial,
          contatoAutorizacao: data.contato_autorizacao,
          observacoes: data.observacoes,
          linkPortal: data.link_portal,
        };
      });
      
      setData(mapped);
    } catch (err) {
      console.error("Erro ao carregar convênios:", err);
    } finally {
      setLoading(false);
    }
  }

  // preenche convenios de exemplo diretamente no Firestore
  async function seedExamples() {
    const examples: Partial<DataItem>[] = [
      {
        nomeConvenio: "Hospital São Paulo",
        cnpj: "12.345.678/0001-01",
        status: "ativo",
        telefone: "(11) 1234-5678",
        email: "contato@hsp.com.br",
        usuarioPortal: "hspuser",
        senhaPortal: "senha123",
        tiposAtendimento: ["Emergência", "Cirurgia"],
        prazoAutorizacao: "48h",
        documentosNecessarios: ["RG", "CPF"],
        regras: ["Apresentar cartão"],
        contatoComercial: "comercial@hsp.com.br",
        contatoAutorizacao: "autorizacao@hsp.com.br",
        observacoes: "Nenhuma",
        linkPortal: "https://portal.hsp.com.br",
      },
      {
        nomeConvenio: "Clínica Alfa",
        cnpj: "98.765.432/0001-99",
        status: "credenciamento",
        telefone: "(21) 8765-4321",
        email: "contato@clinalfa.com",
        usuarioPortal: "alfaclin",
        senhaPortal: "alfasenha",
        tiposAtendimento: ["Consulta"],
        prazoAutorizacao: "24h",
        documentosNecessarios: ["Cartão SUS"],
        regras: ["Agendar com antecedência"],
        contatoComercial: "vend@clinalfa.com",
        contatoAutorizacao: "aut@clinalfa.com",
        observacoes: "Horário reduzido aos fins de semana",
        linkPortal: "https://portal.clinalfa.com",
      },
    ];

    try {
      for (const item of examples) {
        await addDoc(collection(db, "convenios"), {
          ...item,
          createdAt: new Date().toISOString(),
        });
      }
      alert("Dados de exemplo adicionados com sucesso.");
      loadConvenios();
    } catch (err) {
      console.error("Erro ao popular dados de exemplo:", err);
      alert("Falha ao adicionar exemplos");
    }
  }

  const filteredData = data.filter(
    (item) =>
      item.nomeConvenio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.cnpj.includes(searchTerm)
  );

  async function handleDelete(id: string) {
    if (!confirm("Tem certeza que deseja deletar este convênio?")) return;

    try {
      await deleteDoc(doc(db, "convenios", id));
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      alert("Erro ao deletar convênio");
    }
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <p className="text-gray-600">Carregando convênios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header com Logout */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Building2 className="size-10 text-blue-600" />
              <h1 className="text-4xl font-bold">Painel de Admin</h1>
            </div>
            <p className="text-gray-600">Gerenciar convênios hospitalares</p>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 border-red-200 hover:bg-red-50"
          >
            <LogOut className="size-4 mr-2" />
            Sair
          </Button>
        </div>

        {/* Ações */}
        <div className="bg-white rounded-xl p-6 border mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              onClick={() => navigate("/admin/novo")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="size-4 mr-2" />
              Novo Convênio
            </Button>
            {/* botão para popular exemplos */}
            <Button
              onClick={seedExamples}
              className="bg-yellow-600 hover:bg-yellow-700"
            >
              Popular Exemplo
            </Button>
          </div>
        </div>

        {/* Contador */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "convênio encontrado" : "convênios encontrados"}
          </p>
        </div>

        {/* Tabela */}
        {filteredData.length > 0 ? (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Nome
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Contato
                    </th>
                    <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <p className="font-medium">{item.nomeConvenio}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {item.cnpj}
                      </td>
                      <td className="px-6 py-4">
                        <Badge className={STATUS_COLORS[item.status]}>
                          {STATUS_LABELS[item.status]}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <p>{item.email}</p>
                        <p className="text-xs">{item.telefone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/admin/editar/${item.id}`)}
                          >
                            <Edit2 className="size-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Building2 className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum convênio encontrado</p>
            <Button
              onClick={() => navigate("/admin/novo")}
              className="bg-green-600 hover:bg-green-700"
            >
              <Plus className="size-4 mr-2" />
              Criar Primeiro Convênio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
