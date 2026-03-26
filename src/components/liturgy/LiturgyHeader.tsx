import { Calendar, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { getLiturgicalColorClass, formatPortugueseDate, dateToInputValue, inputValueToDate } from "@/lib/liturgy-api";
import { motion } from "framer-motion";

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
    width="28" 
    height="28" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="1.5" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className="crucifix-svg mx-auto mb-3"
  >
    <path d="M12 2v20M8 7h8" />
    <path d="M12 7v0" />
  </svg>
);

export default function LiturgyHeader({ data, liturgia, cor, selectedDate, onDateChange, darkMode, onToggleDark }: Props) {
  const colorClasses = getLiturgicalColorClass(cor);
  const inputDate = dateToInputValue(selectedDate);
  const formattedDate = formatPortugueseDate(data);

  const handleNavigate = (days: number) => {
    // Criamos uma nova data baseada na data selecionada atual
    const newDate = new Date(selectedDate.getTime());
    newDate.setDate(newDate.getDate() + days);
    // Garantimos que a hora seja zerada para evitar problemas de fuso horário
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

        <div className="relative group">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          <input
            type="date"
            value={inputDate}
            onChange={(e) => e.target.value && onDateChange(inputValueToDate(e.target.value))}
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-1 focus:ring-gold outline-none transition-all cursor-pointer"
          />
        </div>
      </div>
    </header>
  );
}