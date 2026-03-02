import { useEffect, useMemo, useState } from "react";
import { DataCard, DataItem } from "./components/data-card";
import { DataDetailModal } from "./components/data-detail-modal";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./components/ui/select";
import { Search, Filter, LayoutGrid, List, ArrowUpDown, Building2 } from "lucide-react";
import { Badge } from "./components/ui/badge";
import { supabase } from "./lib/supabaseClient";

export default function App() {
  function normalizeDigits(s?: string) {
    return (s ?? "").replace(/\D/g, "");
  }

  const [data, setData] = useState<DataItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "ativo" | "credenciamento" | "suspenso">("all");
  const [sortBy, setSortBy] = useState<"nome" | "status" | "prazo">("nome");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedItem, setSelectedItem] = useState<DataItem | null>(null);

  useEffect(() => {
    async function load() {
      setLoadingData(true);
      try {
        const { data, error } = await supabase
          .from("convenios")
          .select("*")
          .order("nome_convenio", { ascending: true });

        if (!error && data) {
          const mapped: DataItem[] = data.map((row: any) => ({
            id: String(row.codigo),
            nomeConvenio: row.nome_convenio,
            cnpj: row.cnpj,
            status: row.status,
            telefone: row.telefone,
            email: row.email,
            usuarioPortal: row.usuario_portal ?? undefined,
            senhaPortal: row.senha_portal ?? undefined,
            tiposAtendimento: row.tipos_atendimento ?? [],
            prazoAutorizacao: row.prazo_autorizacao,
            documentosNecessarios: row.documentos_necessarios ?? [],
            regras: row.regras ?? [],
            contatoComercial: row.contato_comercial ?? undefined,
            contatoAutorizacao: row.contato_autorizacao ?? undefined,
            observacoes: row.observacoes ?? undefined,
            linkPortal: row.link_portal ?? undefined,
          }));
          setData(mapped);
        } else if (error) {
          console.error("Supabase error:", error);
        }
      } catch (err) {
        console.error("Failed to load convenios:", err);
      } finally {
        setLoadingData(false);
      }
    }

    load();
  }, []);

  // Filtrar e ordenar dados (busca normalizada para CNPJ/telefone)
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const termDigits = normalizeDigits(term);

    const filtered = data.filter((item) => {
      const matchesSearch =
        item.nomeConvenio.toLowerCase().includes(term) ||
        normalizeDigits(item.cnpj).includes(termDigits) ||
        String(item.id).toLowerCase().includes(term) ||
        normalizeDigits(item.telefone).includes(termDigits);

      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Ordenação
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

  // Estatísticas
  const stats = useMemo(
    () => ({
      total: data.length,
      ativos: data.filter((item) => item.status === "ativo").length,
      suspensos: data.filter((item) => item.status === "suspenso").length,
      credenciamento: data.filter((item) => item.status === "credenciamento").length,
    }),
    [data]
  );

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
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <Building2 className="size-10 text-blue-600" />
            <div>
              <h1 className="text-4xl mb-1">Convênios Hospitalares</h1>
              <p className="text-gray-600">
                Gestão completa de convênios, regras e autorizações
              </p>
            </div>
          </div>

          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
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
              <p className="text-2xl font-semibold text-yellow-600">
                {stats.credenciamento}
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg border-2 border-red-100">
              <p className="text-sm text-gray-600">Suspensos</p>
              <p className="text-2xl font-semibold text-red-600">{stats.suspensos}</p>
            </div>
          </div>
        </div>

        {/* Filtros e Busca */}
        <div className="bg-white p-6 rounded-xl shadow-sm border mb-8 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Busca */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome, CNPJ, telefone ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtro de Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
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

            {/* Ordenação */}
            <Select value={sortBy} onValueChange={setSortBy}>
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

            {/* Toggle de Visualização */}
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("grid")}
                aria-label="Modo grade"
                aria-pressed={viewMode === "grid"}
              >
                <LayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="icon"
                onClick={() => setViewMode("list")}
                aria-label="Modo lista"
                aria-pressed={viewMode === "list"}
              >
                <List className="size-4" />
              </Button>
            </div>
          </div>

          {/* Filtros Ativos */}
          {(searchTerm || statusFilter !== "all") && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm text-gray-600">Filtros ativos:</span>
              {searchTerm && (
                <Badge variant="secondary">Busca: "{searchTerm}"</Badge>
              )}
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