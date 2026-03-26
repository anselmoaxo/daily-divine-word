import { Cross, Calendar, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { getLiturgicalColorClass, formatPortugueseDate, dateToInputValue, inputValueToDate } from "@/lib/liturgy-api";
import { motion } from "framer-motion";

interface Props {
  data: string;
  liturgia: string;
  cor: string;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onToday: () => void;
  darkMode: boolean;
  onToggleDark: () => void;
}

export default function LiturgyHeader({ data, liturgia, cor, selectedDate, onDateChange, onToday, darkMode, onToggleDark }: Props) {
  const colorClasses = getLiturgicalColorClass(cor);
  const inputDate = dateToInputValue(selectedDate);
  const formattedDate = formatPortugueseDate(data);

  const goDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    onDateChange(d);
  };

  return (
    <header className="text-center mb-12">
      <div className="flex justify-between items-center mb-8">
        <div className="w-10" /> {/* Spacer */}
        <Cross className="text-primary" size={32} strokeWidth={1.5} />
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full hover:bg-secondary transition-colors"
          aria-label="Modo escuro"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <div className="space-y-2 mb-8">
        <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
          Liturgia Diária
        </h1>
        <p className="font-ui text-xs tracking-[0.3em] uppercase text-muted-foreground">
          Igreja Católica Apostólica Romana
        </p>
      </div>

      <div className="gold-divider" />

      <motion.div
        key={data}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="my-10"
      >
        <p className="font-display text-2xl md:text-3xl font-bold mb-2">
          {formattedDate}
        </p>
        <p className="font-body text-lg text-primary font-semibold italic max-w-xl mx-auto px-4">
          {liturgia}
        </p>
      </motion.div>

      {cor && (
        <div className="mb-10">
          <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase border ${colorClasses.bg} ${colorClasses.text} ${colorClasses.border}`}>
            <span className={`w-2 h-2 rounded-full ${colorClasses.dot}`} />
            Cor: {cor}
          </span>
        </div>
      )}

      {/* Navigation Controls */}
      <div className="flex flex-col gap-4 items-center">
        <div className="flex items-center gap-2">
          <button onClick={() => goDay(-1)} className="cnbb-btn-nav" title="Ontem">Ontem</button>
          <button onClick={onToday} className="cnbb-btn-nav bg-primary text-primary-foreground">Hoje</button>
          <button onClick={() => goDay(1)} className="cnbb-btn-nav" title="Amanhã">Amanhã</button>
        </div>
        
        <div className="relative inline-block">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={14} />
          <input
            type="date"
            value={inputDate}
            onChange={(e) => e.target.value && onDateChange(inputValueToDate(e.target.value))}
            className="pl-9 pr-4 py-2 rounded-lg border border-border bg-card text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
          />
        </div>
      </div>
    </header>
  );
}