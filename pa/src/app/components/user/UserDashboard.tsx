import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DataCard, DataItem } from "../shared/DataCard";
import { DataDetailModal } from "../shared/DataDetailModal";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Search, Filter, LayoutGrid, List, ArrowUpDown, Building2, LogOut } from "lucide-react";
import { Badge } from "../ui/badge";
import { db } from "../../lib/firebaseClient";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import { normalizeDigits } from "../../utils";

export default function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [data, setData] = useState<DataItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ativo" | "credenciamento" | "suspenso">("all");
  const [sortBy, setSortBy] = useState<"nome" | "status" | "prazo">("nome");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  useEffect(() => {
    loadConvenios();
  }, []);

  async function loadConvenios() {
    setLoadingData(true);
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
      setLoadingData(false);
    }
  }

  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const termDigits = normalizeDigits(term);

    const filtered = data.filter((item) => {
      const matchesSearch =
        item.nomeConvenio.toLowerCase().includes(term) ||
        normalizeDigits(item.cnpj).includes(termDigits) ||
        String(item.id).toLowerCase().includes(term) ||
        normalizeDigits(item.telefone).includes(termDigits);

      const matchesStatus = statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "nome":
          return a.nomeConvenio.localeCompare(b.nomeConvenio);
        case "status":
          return a.status.localeCompare(b.status);
        case "prazo":
          return (a.prazoAutorizacao ?? "").localeCompare(b.prazoAutorizacao ?? "");
        default:
          return 0;
      }
    });
  }, [data, searchTerm, statusFilter, sortBy]);

  const stats = useMemo(
    () => ({
      total: data.length,
      ativos: data.filter((item) => item.status === "ativo").length,
      suspensos: data.filter((item) => item.status === "suspenso").length,
      credenciamento: data.filter((item) => item.status === "credenciamento").length,
    }),
    [data]
  );

  function handleLogout() {
    logout();
    navigate("/");
  }

  if (loadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <p className="text-gray-600">Carregando convênios...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <Building2 className="size-10 text-blue-600" />
              <div>
                <h1 className="text-4xl font-bold">Convênios Hospitalares</h1>
                <p className="text-gray-600">Visualize as informações de convênios disponíveis</p>
              </div>
            </div>
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

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 mb-8">
          <div className="bg-white p-4 rounded-lg border-2 border-blue-100">
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-2xl font-semibold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-green-100">
            <p className="text-sm text-gray-600">Ativos</p>
            <p className="text-2xl font-semibold text-green-600">{stats.ativos}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-yellow-100">
            <p className="text-sm text-gray-600">Credenciamento</p>
            <p className="text-2xl font-semibold text-yellow-600">{stats.credenciamento}</p>
          </div>
          <div className="bg-white p-4 rounded-lg border-2 border-red-100">
            <p className="text-sm text-gray-600">Suspensos</p>
            <p className="text-2xl font-semibold text-red-600">{stats.suspensos}</p>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ, telefone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                if (
                  val === "all" ||
                  val === "ativo" ||
                  val === "credenciamento" ||
                  val === "suspenso"
                ) {
                  setStatusFilter(val);
                }
              }}
            >
              <SelectTrigger className="w-full lg:w-[200px]">
                <Filter className="size-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="credenciamento">Credenciamento</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={sortBy}
              onValueChange={(val) => {
                if (val === "nome" || val === "status" || val === "prazo") {
                  setSortBy(val);
                }
              }}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <ArrowUpDown className="size-4 mr-2" />
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nome">Nome</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="prazo">Prazo</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {(searchTerm || statusFilter !== "all") && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {searchTerm && <Badge variant="secondary">Busca: "{searchTerm}"</Badge>}
              {statusFilter !== "all" && (
                <Badge variant="secondary">
                  Status:{" "}
                  {statusFilter === "ativo"
                    ? "Ativo"
                    : statusFilter === "credenciamento"
                    ? "Credenciamento"
                    : "Suspenso"}
                </Badge>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                }}
              >
                Limpar filtros
              </Button>
            </div>
          )}
        </div>

        {/* Contador de Resultados */}
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            {filteredData.length}{" "}
            {filteredData.length === 1 ? "convênio encontrado" : "convênios encontrados"}
          </p>
        </div>

        {/* Grid/List de Cards */}
        {filteredData.length > 0 ? (
          <div
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                : "flex flex-col gap-4"
            }
          >
            {filteredData.map((item) => (
              <DataCard key={item.id} item={item} onClick={setSelectedItem} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-xl border">
            <Building2 className="size-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">
              Nenhum convênio encontrado com os filtros aplicados.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
              }}
            >
              Limpar filtros
            </Button>
          </div>
        )}

        {/* Modal de Detalhes */}
        <DataDetailModal
          item={selectedItem}
          open={!!selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      </div>
    </div>
  );
}
