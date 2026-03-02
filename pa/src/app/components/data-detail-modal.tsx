import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import {
  Phone,
  Mail,
  Clock,
  Shield,
  Key,
  FileText,
  User,
  ExternalLink,
  Building2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { DataItem } from "./data-card";
import { Button } from "./ui/button";
import { Separator } from "./ui/separator";

interface DataDetailModalProps {
  item: DataItem | null;
  open: boolean;
  onClose: () => void;
}

export function DataDetailModal({ item, open, onClose }: DataDetailModalProps) {
  if (!item) return null;

  const statusColors = {
    ativo: "bg-green-500/10 text-green-700 border-green-500/20",
    suspenso: "bg-red-500/10 text-red-700 border-red-500/20",
    credenciamento: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
  };

  const statusLabels = {
    ativo: "Ativo",
    suspenso: "Suspenso",
    credenciamento: "Em Credenciamento",
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-2xl">{item.nomeConvenio}</DialogTitle>
              <DialogDescription className="mt-2">
                CNPJ: {item.cnpj}
              </DialogDescription>
            </div>
            <Badge className={statusColors[item.status]}>
              {statusLabels[item.status]}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações de Contato */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Building2 className="size-5" />
              Informações de Contato
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Phone className="size-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">Telefone Principal</p>
                  <p className="font-medium">{item.telefone}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Mail className="size-5 text-blue-600" />
                <div>
                  <p className="text-xs text-gray-600">E-mail</p>
                  <p className="font-medium text-sm">{item.email}</p>
                </div>
              </div>

              {item.contatoComercial && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="size-5 text-purple-600" />
                  <div>
                    <p className="text-xs text-gray-600">Contato Comercial</p>
                    <p className="font-medium text-sm">{item.contatoComercial}</p>
                  </div>
                </div>
              )}

              {item.contatoAutorizacao && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <User className="size-5 text-orange-600" />
                  <div>
                    <p className="text-xs text-gray-600">Contato Autorização</p>
                    <p className="font-medium text-sm">{item.contatoAutorizacao}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Acesso ao Portal */}
          {item.usuarioPortal && (
            <>
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Key className="size-5" />
                  Acesso ao Portal
                </h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Usuário</p>
                      <p className="font-mono font-medium bg-white px-3 py-2 rounded border">
                        {item.usuarioPortal}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600 mb-1">Senha</p>
                      <p className="font-mono font-medium bg-white px-3 py-2 rounded border">
                        {item.senhaPortal || "Ipo132*"}
                      </p>
                    </div>
                  </div>
                  {item.linkPortal && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={item.linkPortal} target="_blank" rel="noopener noreferrer">
                        Acessar Portal
                        <ExternalLink className="size-4 ml-2" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
              <Separator />
            </>
          )}

          {/* Prazo e Processos */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Clock className="size-5" />
              Prazos e Processos
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-gray-600">Prazo de Autorização</p>
              <p className="text-xl font-semibold text-orange-700 mt-1">
                {item.prazoAutorizacao}
              </p>
            </div>
          </div>

          <Separator />

          {/* Tipos de Atendimento */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Shield className="size-5" />
              Tipos de Atendimento Cobertos
            </h3>
            <div className="flex flex-wrap gap-2">
              {item.tiposAtendimento.map((tipo, index) => (
                <Badge key={index} variant="secondary" className="px-3 py-1">
                  <CheckCircle2 className="size-3 mr-1" />
                  {tipo}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Documentos Necessários */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="size-5" />
              Documentos Necessários
            </h3>
            <ul className="space-y-2">
              {item.documentosNecessarios.map((doc, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{doc}</span>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          {/* Regras e Procedimentos */}
          <div>
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <AlertCircle className="size-5" />
              Regras e Procedimentos
            </h3>
            <ul className="space-y-2">
              {item.regras.map((regra, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertCircle className="size-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{regra}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Observações */}
          {item.observacoes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-lg mb-3">Observações</h3>
                <p className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg">
                  {item.observacoes}
                </p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}