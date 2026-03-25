const BASE_URL = "https://liturgia.up.railway.app/v2";

export interface LeituraItem {
  referencia: string;
  titulo?: string;
  texto: string;
  refrao?: string;
}

export interface OracaoExtra {
  titulo: string;
  texto: string;
}

export interface LiturgiaData {
  data: string;
  liturgia: string;
  cor: string;
  oracoes: {
    coleta: string;
    oferendas: string;
    comunhao: string;
    extras: OracaoExtra[];
  };
  leituras: {
    primeiraLeitura: LeituraItem[];
    segundaLeitura: LeituraItem[];
    salmo: LeituraItem[];
    evangelho: LeituraItem[];
    extras?: LeituraItem[];
  };
  antifonas?: {
    entrada: string;
    comunhao: string;
  };
}

/**
 * Converts a Date to dd/mm/yyyy string for the API
 */
function formatDateForApi(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Converts a yyyy-mm-dd string (from input[type=date]) to a local Date
 */
export function inputValueToDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Converts a Date to yyyy-mm-dd for input[type=date]
 */
export function dateToInputValue(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export async function fetchLiturgia(date?: Date): Promise<LiturgiaData> {
  let url = `${BASE_URL}/`;
  if (date) {
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const ano = date.getFullYear();
    url = `${BASE_URL}/?dia=${dia}&mes=${mes}&ano=${ano}`;
  }

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Erro ao buscar liturgia: ${res.status}`);
  }
  const data = await res.json();

  // Normalize arrays
  const leituras = data.leituras || {};
  return {
    ...data,
    leituras: {
      primeiraLeitura: Array.isArray(leituras.primeiraLeitura) ? leituras.primeiraLeitura : leituras.primeiraLeitura ? [leituras.primeiraLeitura] : [],
      segundaLeitura: Array.isArray(leituras.segundaLeitura) ? leituras.segundaLeitura : leituras.segundaLeitura ? [leituras.segundaLeitura] : [],
      salmo: Array.isArray(leituras.salmo) ? leituras.salmo : leituras.salmo ? [leituras.salmo] : [],
      evangelho: Array.isArray(leituras.evangelho) ? leituras.evangelho : leituras.evangelho ? [leituras.evangelho] : [],
      extras: Array.isArray(leituras.extras) ? leituras.extras : [],
    },
    oracoes: {
      coleta: data.oracoes?.coleta || "",
      oferendas: data.oracoes?.oferendas || "",
      comunhao: data.oracoes?.comunhao || "",
      extras: Array.isArray(data.oracoes?.extras) ? data.oracoes.extras : [],
    },
  };
}

export function getLiturgicalColorClass(cor: string): { bg: string; text: string; dot: string } {
  const c = cor?.toLowerCase() || "";
  if (c.includes("roxo") || c.includes("violeta")) return { bg: "bg-purple-100 dark:bg-purple-900/30", text: "text-purple-800 dark:text-purple-300", dot: "bg-purple-600" };
  if (c.includes("branco")) return { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-800 dark:text-amber-300", dot: "bg-amber-100 border border-amber-300" };
  if (c.includes("verde")) return { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-800 dark:text-green-300", dot: "bg-green-600" };
  if (c.includes("vermelho")) return { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-800 dark:text-red-300", dot: "bg-red-600" };
  if (c.includes("rosa")) return { bg: "bg-pink-100 dark:bg-pink-900/30", text: "text-pink-800 dark:text-pink-300", dot: "bg-pink-500" };
  return { bg: "bg-secondary", text: "text-secondary-foreground", dot: "bg-muted-foreground" };
}

export function formatPortugueseDate(dateStr: string): string {
  const months = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];
  const weekdays = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];

  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return `${weekdays[d.getDay()]}, ${parseInt(day)} de ${months[d.getMonth()]} de ${year}`;
}
