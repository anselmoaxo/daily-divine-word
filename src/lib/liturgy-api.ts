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
  santo?: string;
  reflexao?: string;
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

export function inputValueToDate(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

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

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Erro ao buscar liturgia: ${res.status}`);
    const data = await res.json();
    if (!data) throw new Error("A API retornou dados vazios.");

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
  } catch (error: unknown) {
    console.error("Fetch error:", error);
    throw error;
  }
}

export interface LiturgicalColorTheme {
  bg: string;
  text: string;
  dot: string;
  border: string;
  accentText: string;
  buttonBg: string;
  buttonHover: string;
  cardBorder: string;
}

export function getLiturgicalColorClass(cor: string): LiturgicalColorTheme {
  const c = cor?.toLowerCase() || "";
  
  if (c.includes("roxo") || c.includes("violeta")) {
    return { 
      bg: "bg-purple-100 dark:bg-purple-950/30", 
      text: "text-purple-800 dark:text-purple-300", 
      dot: "bg-purple-600", 
      border: "border-purple-300 dark:border-purple-800",
      accentText: "text-purple-700 dark:text-purple-400",
      buttonBg: "bg-purple-700 hover:bg-purple-800 dark:bg-purple-600 dark:hover:bg-purple-700 text-white",
      buttonHover: "hover:bg-purple-50 dark:hover:bg-purple-950/20",
      cardBorder: "border-purple-200 dark:border-purple-900/50"
    };
  }
  if (c.includes("branco") || c.includes("dourado")) {
    return { 
      bg: "bg-amber-50 dark:bg-amber-950/20", 
      text: "text-amber-800 dark:text-amber-300", 
      dot: "bg-amber-400 border border-amber-300", 
      border: "border-amber-200 dark:border-amber-900/50",
      accentText: "text-amber-700 dark:text-amber-400",
      buttonBg: "bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 text-white",
      buttonHover: "hover:bg-amber-50 dark:hover:bg-amber-950/20",
      cardBorder: "border-amber-200 dark:border-amber-900/50"
    };
  }
  if (c.includes("verde")) {
    return { 
      bg: "bg-emerald-100 dark:bg-emerald-950/30", 
      text: "text-emerald-800 dark:text-emerald-300", 
      dot: "bg-emerald-600", 
      border: "border-emerald-300 dark:border-emerald-800",
      accentText: "text-emerald-700 dark:text-emerald-400",
      buttonBg: "bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white",
      buttonHover: "hover:bg-emerald-50 dark:hover:bg-emerald-950/20",
      cardBorder: "border-emerald-200 dark:border-emerald-900/50"
    };
  }
  if (c.includes("vermelho")) {
    return { 
      bg: "bg-red-100 dark:bg-red-950/30", 
      text: "text-red-800 dark:text-red-300", 
      dot: "bg-red-600", 
      border: "border-red-300 dark:border-red-800",
      accentText: "text-red-700 dark:text-red-400",
      buttonBg: "bg-red-700 hover:bg-red-800 dark:bg-red-600 dark:hover:bg-red-700 text-white",
      buttonHover: "hover:bg-red-50 dark:hover:bg-red-950/20",
      cardBorder: "border-red-200 dark:border-red-900/50"
    };
  }
  if (c.includes("rosa")) {
    return { 
      bg: "bg-pink-100 dark:bg-pink-950/30", 
      text: "text-pink-800 dark:text-pink-300", 
      dot: "bg-pink-500", 
      border: "border-pink-300 dark:border-pink-800",
      accentText: "text-pink-700 dark:text-pink-400",
      buttonBg: "bg-pink-700 hover:bg-pink-800 dark:bg-pink-600 dark:hover:bg-pink-700 text-white",
      buttonHover: "hover:bg-pink-50 dark:hover:bg-pink-950/20",
      cardBorder: "border-pink-200 dark:border-pink-900/50"
    };
  }
  
  // Fallback padrão (Tons terrosos/dourados)
  return { 
    bg: "bg-amber-50/50 dark:bg-stone-900/40", 
    text: "text-amber-900 dark:text-amber-200", 
    dot: "bg-amber-600", 
    border: "border-amber-200 dark:border-stone-800",
    accentText: "text-amber-700 dark:text-amber-400",
    buttonBg: "bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-700 text-white",
    buttonHover: "hover:bg-amber-50 dark:hover:bg-stone-900/20",
    cardBorder: "border-amber-200/60 dark:border-stone-800"
  };
}

export function formatPortugueseDate(dateStr: string): string {
  if (!dateStr) return "";
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const weekdays = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];
  const parts = dateStr.split("/");
  if (parts.length !== 3) return dateStr;
  const [day, month, year] = parts;
  const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  return `${weekdays[d.getDay()]}, ${parseInt(day)} de ${months[d.getMonth()]} de ${year}`;
}
