// Status colors for badges
export const STATUS_COLORS = {
  ativo: "bg-green-500/10 text-green-700 border-green-500/20",
  suspenso: "bg-red-500/10 text-red-700 border-red-500/20",
  credenciamento: "bg-yellow-500/10 text-yellow-700 border-yellow-500/20",
} as const;

// Status labels (in Portuguese)
export const STATUS_LABELS = {
  ativo: "Ativo",
  suspenso: "Suspenso",
  credenciamento: "Em Credenciamento",
} as const;

// Default portal password
export const DEFAULT_PORTAL_PASSWORD = "Ipo132*";
