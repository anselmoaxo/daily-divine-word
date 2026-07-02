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

const Crucifix = ({ colorClass }: { colorClass: string }) => (
  <svg 
    width="32" 
    height="40" 
    viewBox="0 0 24 32" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("crucifix-svg mx-auto mb-4 transition-colors duration-300", colorClass)}
  >
    <path d="M12 2v28" />
    <path d="M6 10h12" />
    <path d="M10 4h4" className="opacity-60" />
    <path d="M9 30h6" strokeWidth="1" />
    <circle cx="12" cy="2" r="0.5" fill="currentColor" />
    <circle cx="6" cy="10" r="0.5" fill="currentColor" />
    <circle cx="18" cy="10" r="0.5" fill="currentColor" />
    <circle cx="12" cy="30" r="0.5" fill="currentColor" />
  </svg>
);

export default function LiturgyHeader({ data, liturgia, cor, selectedDate, onDateChange, darkMode, onToggleDark }: Props) {
  const colorTheme = getLiturgicalColorClass(cor);
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
        <Crucifix colorClass={colorTheme.accentText} />
        <button
          onClick={onToggleDark}
          className="p-2.5 rounded-full hover:bg-secondary/60 transition-colors border border-transparent hover:border-border/40"
          aria-label="Alternar tema"
        >
          {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} className="text-stone-600" />}
        </button>
      </div>

      <div className="space-y-3 mb-10">
        <h1 className="text-[40px] md:text-[46px] font-display font-bold tracking-tight leading-tight text-foreground">
          Liturgia Diária
        </h1>
        <p className="text-[11px] font-ui tracking-[0.3em] uppercase opacity-60 font-semibold">
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
        <p className="text-[22px] md:text-[24px] font-display font-semibold mb-3 text-foreground">
          {formattedDate}
        </p>
        <p className={cn("text-lg font-semibold italic max-w-xl mx-auto px-4 leading-relaxed transition-colors duration-300", colorTheme.accentText)}>
          {liturgia}
        </p>
      </motion.div>

      {cor && (
        <div className="mb-12">
          <span className={cn(
            "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[11px] font-bold tracking-widest uppercase border transition-all duration-300",
            colorTheme.bg,
            colorTheme.border,
            colorTheme.text
          )}>
            <span className={cn("w-2.5 h-2.5 rounded-full shadow-sm", colorTheme.dot)} />
            Cor Litúrgica: {cor}
          </span>
        </div>
      )}

      {/* Navigation */}
      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleNavigate(-1)} 
            className="nav-btn border border-border/40 hover:border-border"
          >
            <ChevronLeft size={16} /> Ontem
          </button>
          <button 
            onClick={handleToday} 
            className={cn(
              "nav-btn font-bold shadow-md hover:scale-105 transition-all",
              colorTheme.buttonBg
            )}
          >
            Hoje
          </button>
          <button 
            onClick={() => handleNavigate(1)} 
            className="nav-btn border border-border/40 hover:border-border"
          >
            Amanhã <ChevronRight size={16} />
          </button>
        </div>

        {/* Modern Calendar Picker */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-[240px] justify-start text-left font-normal border-border bg-card hover:bg-secondary/50 transition-all shadow-sm",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className={cn("mr-2 h-4 w-4", colorTheme.accentText)} />
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