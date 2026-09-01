import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Moon, Sun } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatPortugueseDate, getLiturgicalColorClass } from "@/lib/liturgy-api";

interface Props {
  data: string;
  liturgia: string;
  cor: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function LiturgyHeader({ data, liturgia, cor, selectedDate, onDateChange, darkMode, onToggleDark }: Props) {
  const colorTheme = getLiturgicalColorClass(cor);

  const handleNavigate = (days: number) => {
    const nextDate = new Date(selectedDate);
    nextDate.setDate(nextDate.getDate() + days);
    nextDate.setHours(0, 0, 0, 0);
    onDateChange(nextDate);
  };

  const handleToday = () => {
    const now = new Date();
    onDateChange(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  return (
    <header className="hero-shell">
      <div className="hero-glow hero-glow-left" aria-hidden="true" />
      <div className="hero-glow hero-glow-right" aria-hidden="true" />

      <nav className="relative z-10 flex items-center justify-between border-b border-white/10 px-5 py-4 sm:px-8 lg:px-12" aria-label="Navegação principal">
        <a href="#conteudo" className="group flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#d8b65b]/30 bg-white/10 shadow-lg backdrop-blur">
            <img src="/papal-keys.svg" alt="" className="h-9 w-9 object-contain" />
          </span>
          <span className="text-left">
            <span className="block font-display text-lg font-bold leading-none text-white">Liturgia Diária</span>
            <span className="mt-1 block font-ui text-[9px] font-semibold uppercase tracking-[0.22em] text-[#e8cf87]">Tradição Católica</span>
          </span>
        </a>

        <div className="hidden items-center gap-6 text-xs font-semibold text-white/70 md:flex">
          <a href="#leituras" className="transition-colors hover:text-white">Leituras</a>
          <a href="#evangelho" className="transition-colors hover:text-white">Evangelho</a>
          <a href="#oracoes" className="transition-colors hover:text-white">Orações</a>
          <a href="#whatsapp" className="transition-colors hover:text-white">WhatsApp</a>
        </div>

        <button
          type="button"
          onClick={onToggleDark}
          className="grid h-10 w-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
          aria-label={darkMode ? "Ativar tema claro" : "Ativar tema escuro"}
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl px-5 pb-32 pt-16 text-center sm:px-8 sm:pt-20 lg:pb-36">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
          <div className="mx-auto mb-7 inline-flex items-center gap-2 rounded-full border border-[#e3c46f]/30 bg-[#e3c46f]/10 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#f0d991]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f0d991] shadow-[0_0_12px_#f0d991]" />
            Palavra, oração e comunhão
          </div>
          <h1 className="text-balance font-display text-5xl font-bold tracking-[-0.035em] text-white sm:text-6xl lg:text-7xl">
            A Palavra de Deus<br className="hidden sm:block" /> para o seu dia
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty font-body text-lg leading-relaxed text-white/70 sm:text-xl">
            Acompanhe as leituras, o Evangelho e as orações da Santa Missa na tradição da Igreja Católica Apostólica Romana.
          </p>
        </motion.div>
      </div>

      <motion.div
        key={data}
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute inset-x-4 bottom-0 z-20 mx-auto max-w-4xl translate-y-1/2 rounded-[1.75rem] border border-white/60 bg-card/95 p-5 shadow-[0_24px_70px_-28px_rgba(36,18,20,0.55)] backdrop-blur-xl sm:inset-x-8 sm:p-7"
      >
        <div className="flex flex-col items-center justify-between gap-5 lg:flex-row">
          <div className="min-w-0 text-center lg:text-left">
            <p className="font-ui text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Liturgia selecionada</p>
            <p className="mt-2 font-display text-xl font-bold text-foreground sm:text-2xl">{formatPortugueseDate(data)}</p>
            <p className={cn("mt-1 max-w-xl font-body text-sm font-semibold italic sm:text-base", colorTheme.accentText)}>{liturgia}</p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="outline" size="icon" onClick={() => handleNavigate(-1)} aria-label="Liturgia do dia anterior" className="rounded-full">
                <ChevronLeft size={17} />
              </Button>
              <Button type="button" onClick={handleToday} className={cn("rounded-full px-6 font-bold shadow-md", colorTheme.buttonBg)}>Hoje</Button>
              <Button type="button" variant="outline" size="icon" onClick={() => handleNavigate(1)} aria-label="Liturgia do dia seguinte" className="rounded-full">
                <ChevronRight size={17} />
              </Button>
            </div>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="rounded-full text-xs text-muted-foreground">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && onDateChange(date)} initialFocus locale={ptBR} />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </motion.div>
    </header>
  );
}
