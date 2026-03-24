import { Cross, Calendar, Sun, Moon, ChevronLeft, ChevronRight } from "lucide-react";
import { getLiturgicalColorClass, formatPortugueseDate, dateToInputValue, inputValueToDate } from "@/lib/liturgy-api";
import { motion, AnimatePresence } from "framer-motion";

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

  // Extract weekday and rest
  const weekday = formattedDate.split(",")[0];
  const restOfDate = formattedDate.split(",").slice(1).join(",").trim();

  const goDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    onDateChange(d);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center mb-10 md:mb-14"
    >
      {/* Top bar: dark mode toggle */}
      <div className="flex justify-end mb-6">
        <button
          onClick={onToggleDark}
          className="p-2.5 rounded-full bg-secondary text-secondary-foreground hover:bg-muted transition-colors"
          aria-label="Alternar modo escuro"
        >
          {darkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <Cross className="mx-auto mb-5 text-accent" size={36} strokeWidth={1.2} />

      <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-1 tracking-tight">
        Liturgia Diária
      </h1>
      <p className="font-body text-muted-foreground text-base md:text-lg mb-6">
        Igreja Católica Apostólica Romana
      </p>

      <div className="gold-divider" />

      {/* Animated date display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={data}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.35 }}
          className="mt-6 mb-6"
        >
          <p className="font-display text-lg md:text-xl text-accent font-semibold">
            {weekday}
          </p>
          <p className="font-display text-2xl md:text-3xl text-foreground mt-1 font-bold">
            {restOfDate}
          </p>
          <p className="font-body text-sm md:text-base text-muted-foreground mt-2 italic max-w-lg mx-auto">
            {liturgia}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Liturgical color badge */}
      {cor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <span className={`liturgical-color-badge ${colorClasses.bg} ${colorClasses.text}`}>
            <span className={`w-3 h-3 rounded-full ${colorClasses.dot}`} />
            Cor Litúrgica: {cor}
          </span>
        </motion.div>
      )}

      {/* Date controls */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 font-ui">
        <div className="flex items-center gap-2">
          <button
            onClick={() => goDay(-1)}
            className="p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary transition-colors"
            aria-label="Dia anterior"
          >
            <ChevronLeft size={18} />
          </button>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
            <input
              type="date"
              value={inputDate}
              onChange={(e) => {
                if (e.target.value) {
                  onDateChange(inputValueToDate(e.target.value));
                }
              }}
              className="pl-10 pr-4 py-2.5 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-shadow"
            />
          </div>
          <button
            onClick={() => goDay(1)}
            className="p-2.5 rounded-lg border border-border bg-card text-foreground hover:bg-secondary transition-colors"
            aria-label="Próximo dia"
          >
            <ChevronRight size={18} />
          </button>
        </div>
        <button
          onClick={onToday}
          className="px-5 py-2.5 text-sm rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-medium"
        >
          Hoje
        </button>
      </div>
    </motion.header>
  );
}
