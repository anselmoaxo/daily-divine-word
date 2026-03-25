import { useState, useEffect, useCallback } from "react";
import { BookOpen, Music, ScrollText, Share2 } from "lucide-react";
import { fetchLiturgia, type LiturgiaData } from "@/lib/liturgy-api";
import LiturgyHeader from "@/components/liturgy/LiturgyHeader";
import ReadingCard from "@/components/liturgy/ReadingCard";
import GospelSection from "@/components/liturgy/GospelSection";
import PrayersSection from "@/components/liturgy/PrayersSection";
import AntiphonsSection from "@/components/liturgy/AntiphonsSection";
import LoadingSkeleton from "@/components/liturgy/LoadingSkeleton";
import ErrorDisplay from "@/components/liturgy/ErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";

export default function Index() {
  const [liturgia, setLiturgia] = useState<LiturgiaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  });
  const [darkMode, setDarkMode] = useState(false);

  const load = useCallback(async (date: Date) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchLiturgia(date);
      setLiturgia(data);
    } catch (e: any) {
      setError(e.message || "Erro ao buscar a liturgia. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(selectedDate);
  }, [selectedDate, load]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleDateChange = (date: Date) => setSelectedDate(date);
  const handleToday = () => {
    const now = new Date();
    setSelectedDate(new Date(now.getFullYear(), now.getMonth(), now.getDate()));
  };

  const handleShare = async () => {
    const text = liturgia
      ? `Liturgia Diária - ${liturgia.data}\n${liturgia.liturgia}\nCor: ${liturgia.cor}`
      : "Liturgia Diária";
    if (navigator.share) {
      await navigator.share({ title: "Liturgia Diária", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={() => load(selectedDate)} />;
  if (!liturgia) return null;

  const { leituras } = liturgia;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        <LiturgyHeader
          data={liturgia.data}
          liturgia={liturgia.liturgia}
          cor={liturgia.cor}
          selectedDate={selectedDate}
          onDateChange={handleDateChange}
          onToday={handleToday}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />

        {/* Readings with fade transition */}
        <AnimatePresence mode="wait">
          <motion.div
            key={liturgia.data}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* Evangelho — dedicated component */}
            <GospelSection
              readings={leituras.evangelho}
              index={0}
            />

            {/* Other readings — collapsed */}
            <ReadingCard
              icon={<BookOpen size={20} />}
              label="Primeira Leitura"
              readings={leituras.primeiraLeitura}
              index={1}
            />

            <ReadingCard
              icon={<Music size={20} />}
              label="Salmo Responsorial"
              readings={leituras.salmo}
              index={2}
            />

            <ReadingCard
              icon={<ScrollText size={20} />}
              label="Segunda Leitura"
              readings={leituras.segundaLeitura}
              index={3}
            />

            {leituras.extras && leituras.extras.length > 0 && (
              <ReadingCard
                icon={<BookOpen size={20} />}
                label="Leituras Extras"
                readings={leituras.extras}
                index={4}
              />
            )}

            <PrayersSection oracoes={liturgia.oracoes} index={5} />
            <AntiphonsSection antifonas={liturgia.antifonas || {}} index={6} />
          </motion.div>
        </AnimatePresence>

        {/* Share button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-10"
        >
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-secondary text-secondary-foreground hover:bg-muted transition-colors font-ui text-sm"
          >
            <Share2 size={16} />
            Compartilhar
          </button>
        </motion.div>

        {/* Footer */}
        <footer className="text-center mt-12 pb-8">
          <div className="gold-divider" />
          <p className="font-ui text-xs text-muted-foreground mt-4">
            Dados fornecidos pela API Liturgia Diária • Ad Maiorem Dei Gloriam
          </p>
        </footer>
      </div>
    </div>
  );
}
