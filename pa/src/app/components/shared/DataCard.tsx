import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Phone, Mail, Clock, Shield, Key } from "lucide-react";
import { STATUS_COLORS, STATUS_LABELS } from "../constants";

export interface DataItem {
  id: string;
  nomeConvenio: string;
  cnpj: string;
  status: "ativo" | "suspenso" | "credenciamento";
  telefone: string;
  email: string;
  senhaPortal?: string;
  usuarioPortal?: string;
  tiposAtendimento: string[];
  prazoAutorizacao: string;
  documentosNecessarios: string[];
  regras: string[];
  contatoComercial?: string;
  contatoAutorizacao?: string;
  observacoes?: string;
  linkPortal?: string;
}

interface DataCardProps {
  item: DataItem;
  onClick: (item: DataItem) => void;
}

export function DataCard({ item, onClick }: DataCardProps) {
  return (
    <Card
      className="p-6 hover:shadow-lg transition-all cursor-pointer border-2 hover:border-blue-200"
      onClick={() => onClick(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(item);
        }
      }}
    >
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{item.nomeConvenio}</h3>
            <p className="text-sm text-gray-600 mt-1">CNPJ: {item.cnpj}</p>
          </div>
          <Badge className={STATUS_COLORS[item.status]}>
            {STATUS_LABELS[item.status]}
          </Badge>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Phone className="size-4 text-gray-500 flex-shrink-0" />
            <p className="text-sm truncate">{item.telefone}</p>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="size-4 text-gray-500 flex-shrink-0" />
            <p className="text-sm truncate">{item.email}</p>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="size-4 text-gray-500 flex-shrink-0" />
            <div>
              <p className="text-xs text-gray-500">Prazo de Autorização</p>
              <p className="text-sm font-medium">{item.prazoAutorizacao}</p>
            </div>
          </div>

          {item.usuarioPortal && (
            <div className="flex items-center gap-2">
              <Key className="size-4 text-blue-600 flex-shrink-0" />
              <p className="text-sm text-blue-600 font-medium">Portal Configurado</p>
            </div>
          )}
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="size-4 text-gray-500" />
            <p className="text-xs text-gray-600 font-medium">Tipos de Atendimento:</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {item.tiposAtendimento.slice(0, 3).map((tipo, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tipo}
              </Badge>
            ))}
            {item.tiposAtendimento.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{item.tiposAtendimento.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}