import { Cross, Calendar, Sun, Moon } from "lucide-react";
import { getLiturgicalColorClass, formatPortugueseDate } from "@/lib/liturgy-api";
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
  const inputDate = selectedDate.toISOString().split("T")[0];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-8 md:mb-12"
    >
      <div className="flex justify-end mb-4">
        <button
          onClick={onToggleDark}
          className="p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          aria-label="Alternar modo escuro"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <Cross className="mx-auto mb-4 text-accent" size={32} strokeWidth={1.5} />
      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
        Liturgia Diária
      </h1>
      <p className="font-body text-muted-foreground text-lg mb-4">
        Igreja Católica Apostólica Romana
      </p>

      <div className="gold-divider" />

      <p className="font-display text-xl md:text-2xl text-foreground mt-4 mb-2">
        {formatPortugueseDate(data)}
      </p>
      <p className="font-body text-base md:text-lg text-muted-foreground mb-4 italic">
        {liturgia}
      </p>

      {cor && (
        <span className={`liturgical-color-badge ${colorClasses.bg} ${colorClasses.text}`}>
          <span className={`w-3 h-3 rounded-full ${colorClasses.dot}`} />
          Cor Litúrgica: {cor}
        </span>
      )}

      {/* Date controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6 font-ui">
        <div className="relative">
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          <input
            type="date"
            value={inputDate}
            onChange={(e) => onDateChange(new Date(e.target.value + "T12:00:00"))}
            className="pl-10 pr-4 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          onClick={onToday}
          className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Hoje
        </button>
      </div>
    </motion.header>
  );
}
