import { Calendar as CalendarIcon, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { getLiturgicalColorClass, formatPortugueseDate } from "@/lib/liturgy-api";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  data: string;
  liturgia: string;
  cor: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

const Crucifix = () => (
  <svg 
    width="32" 
    height="40" 
    viewBox="0 0 24 32" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="crucifix-svg mx-auto mb-4 text-gold"
  >
    {/* Haste Vertical Principal */}
    <path d="M12 2v28" />
    {/* Haste Horizontal (Patibulum) */}
    <path d="M6 10h12" />
    {/* Placa INRI (Titulus Crucis) */}
    <path d="M10 4h4" className="opacity-60" />
    {/* Base (Gólgota) */}
    <path d="M9 30h6" strokeWidth="1" />
    {/* Detalhes das extremidades (Estilo Trevo/Botão) */}
    <circle cx="12" cy="2" r="0.5" fill="currentColor" />
    <circle cx="6" cy="10" r="0.5" fill="currentColor" />
    <circle cx="18" cy="10" r="0.5" fill="currentColor" />
    <circle cx="12" cy="30" r="0.5" fill="currentColor" />
  </svg>
);

export default function LiturgyHeader({ data, liturgia, cor, selectedDate, onDateChange, darkMode, onToggleDark }: Props) {
  const colorClasses = getLiturgicalColorClass(cor);
  const formattedDate = formatPortugueseDate(data);

  const handleNavigate = (days: number) => {
    const newDate = new Date(selectedDate.getTime());
    newDate.setDate(newDate.getDate() + days);
    newDate.setHours(0, 0, 0, 0);
    onDateChange(newDate);
  };

  const handleToday = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    onDateChange(today);
  };

  return (
    <header className="text-center mb-16">
      <div className="flex justify-between items-center mb-12">
        <div className="w-10" />
        <Crucifix />
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="space-y-3 mb-10">
        <h1 className="text-[42px] font-display font-semibold tracking-tight leading-tight">
          Liturgia Diária
        </h1>
        <p className="text-[12px] font-ui tracking-[0.3em] uppercase opacity-60 font-medium">
          Igreja Católica Apostólica Romana
        </p>
      </div>

      <div className="liturgy-divider" />

      <motion.div
        key={data}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-10 mb-8"
      >
        <p className="text-[22px] font-display font-medium mb-3">
          {formattedDate}
        </p>
        <p className="text-lg text-gold font-semibold italic max-w-xl mx-auto px-4 leading-relaxed">
          {liturgia}
        </p>
      </motion.div>

      {cor && (
        <div className="mb-12">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border bg-[#f5f0e6] dark:bg-white/5 border-[#d6c7a1] text-[#7a5c2e] dark:text-gold`}>
            <span className={`w-2 h-2 rounded-full ${colorClasses.dot}`} />
            Cor: {cor}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <button onClick={() => handleNavigate(-1)} className="nav-btn">
            <ChevronLeft size={16} /> Ontem
          </button>
          <button 
            onClick={handleToday} 
            className="nav-btn bg-gold text-white hover:bg-gold/80"
          >
            Hoje
          </button>
          <button onClick={() => handleNavigate(1)} className="nav-btn">
            Amanhã <ChevronRight size={16} />
          </button>
        </div>

        {/* Modern Calendar Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal border-border bg-card hover:bg-secondary/50 transition-all",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4 text-gold" />
              {selectedDate ? (
                format(selectedDate, "PPP", { locale: ptBR })
              ) : (
                <span>Selecione uma data</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 border-border shadow-xl" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && onDateChange(date)}
              initialFocus
              locale={ptBR}
              className="bg-card"
            />
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}