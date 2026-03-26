import { useState, useEffect, useCallback } from "react";
import { fetchLiturgia, type LiturgiaData } from "@/lib/liturgy-api";
import LiturgyHeader from "@/components/liturgy/LiturgyHeader";
import ReadingCard from "@/components/liturgy/ReadingCard";
import GospelSection from "@/components/liturgy/GospelSection";
import PrayersSection from "@/components/liturgy/PrayersSection";
import AntiphonsSection from "@/components/liturgy/AntiphonsSection";
import LoadingSkeleton from "@/components/liturgy/LoadingSkeleton";
import ErrorDisplay from "@/components/liturgy/ErrorDisplay";
import WhatsAppRegistration from "@/components/liturgy/WhatsAppRegistration";
import { motion, AnimatePresence } from "framer-motion";
import { Share2 } from "lucide-react";

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
      setError(e.message || "Erro ao buscar a liturgia.");
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

  const handleShare = async () => {
    if (!liturgia) return;
    const text = `Liturgia Diária - ${liturgia.data}\n${liturgia.liturgia}\n\nLeia em: ${window.location.href}`;
    if (navigator.share) {
      await navigator.share({ title: "Liturgia Diária", text });
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={() => load(selectedDate)} />;
  if (!liturgia) return null;

  return (
    <div className="min-h-screen bg-background selection:bg-primary/20">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <LiturgyHeader
          data={liturgia.data}
          liturgia={liturgia.liturgia}
          cor={liturgia.cor}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={liturgia.data}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* 1. Primeira Leitura */}
            <ReadingCard
              label="Primeira Leitura"
              readings={liturgia.leituras.primeiraLeitura}
              index={1}
            />

            {/* 2. Salmo */}
            <ReadingCard
              label="Salmo Responsorial"
              readings={liturgia.leituras.salmo}
              index={2}
            />

            {/* 3. Segunda Leitura (se houver) */}
            <ReadingCard
              label="Segunda Leitura"
              readings={liturgia.leituras.segundaLeitura}
              index={3}
            />

            {/* 4. Evangelho (Destaque) */}
            <GospelSection readings={liturgia.leituras.evangelho} index={4} />

            {/* 5. Orações e Antífonas */}
            <PrayersSection oracoes={liturgia.oracoes} index={5} />
            <AntiphonsSection antifonas={liturgia.antifonas || {}} index={6} />

            {/* 6. Santo do Dia */}
            {liturgia.santo && (
              <section className="cnbb-section">
                <h2 className="cnbb-section-title">SANTO DO DIA</h2>
                <div className="cnbb-text-body px-4 italic text-center">
                  {liturgia.santo}
                </div>
              </section>
            )}

            {/* 7. Reflexão */}
            {liturgia.reflexao && (
              <section className="cnbb-section">
                <h2 className="cnbb-section-title">REFLEXÃO</h2>
                <div className="cnbb-text-body px-4 whitespace-pre-wrap text-base md:text-lg">
                  {liturgia.reflexao}
                </div>
              </section>
            )}

            {/* 8. Cadastro WhatsApp */}
            <WhatsAppRegistration />
          </motion.div>
        </AnimatePresence>

        {/* Ações Finais */}
        <div className="flex justify-center gap-4 mt-16">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
          >
            <Share2 size={18} />
            Compartilhar
          </button>
        </div>

        <footer className="text-center mt-20 pb-10 opacity-50">
          <div className="gold-divider" />
          <p className="font-ui text-[10px] tracking-widest uppercase">
            Conferência Nacional dos Bispos do Brasil<br />
            Texto Oficial da Liturgia Romana
          </p>
        </footer>
      </div>
    </div>
  );
}