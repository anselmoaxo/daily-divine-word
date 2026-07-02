import { useState, useEffect, useCallback } from "react";
import { fetchLiturgia, getLiturgicalColorClass, type LiturgiaData } from "@/lib/liturgy-api";
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
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
    
    try {
      if (navigator.share) {
        await navigator.share({ 
          title: "Liturgia Diária", 
          text: text,
          url: window.location.href 
        });
      } else {
        await navigator.clipboard.writeText(text);
        toast.success("Link copiado para a área de transferência! ✨");
      }
    } catch (err) {
      console.log("Erro ao compartilhar:", err);
    }
  };

  if (loading) return <LoadingSkeleton />;
  if (error) return <ErrorDisplay message={error} onRetry={() => load(selectedDate)} />;
  if (!liturgia) return null;

  const colorTheme = getLiturgicalColorClass(liturgia.cor);

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
            <ReadingCard
              label="Primeira Leitura"
              readings={liturgia.leituras.primeiraLeitura}
              index={1}
              liturgicalColor={liturgia.cor}
            />

            <ReadingCard
              label="Salmo Responsorial"
              readings={liturgia.leituras.salmo}
              index={2}
              liturgicalColor={liturgia.cor}
            />

            <ReadingCard
              label="Segunda Leitura"
              readings={liturgia.leituras.segundaLeitura}
              index={3}
              liturgicalColor={liturgia.cor}
            />

            <GospelSection 
              readings={liturgia.leituras.evangelho} 
              index={4} 
              liturgicalColor={liturgia.cor}
            />

            <PrayersSection oracoes={liturgia.oracoes} index={5} />
            <AntiphonsSection antifonas={liturgia.antifonas || {}} index={6} />

            {liturgia.santo && (
              <section className="cnbb-section">
                <h2 className="cnbb-section-title">SANTO DO DIA</h2>
                <div className="cnbb-text-body px-4 italic text-center max-w-[680px] mx-auto">
                  {liturgia.santo}
                </div>
              </section>
            )}

            {liturgia.reflexao && (
              <section className="cnbb-section">
                <h2 className="cnbb-section-title">REFLEXÃO</h2>
                <div className="cnbb-text-body px-4 whitespace-pre-wrap text-base md:text-lg max-w-[680px] mx-auto leading-relaxed">
                  {liturgia.reflexao}
                </div>
              </section>
            )}

            <WhatsAppRegistration liturgicalColor={liturgia.cor} />
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-center gap-4 mt-16">
          <Button
            onClick={handleShare}
            size="lg"
            className={`rounded-full px-8 py-6 font-bold shadow-lg hover:scale-105 transition-all ${colorTheme.buttonBg}`}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Compartilhar Liturgia
          </Button>
        </div>

        <footer className="text-center mt-20 pb-10 opacity-50">
          <div className="liturgy-divider mb-6" />
          <p className="font-ui text-[10px] tracking-widest uppercase">
            Dados fornecidos por <a href="https://liturgia.up.railway.app/" target="_blank" rel="noopener noreferrer" className="underline hover:text-gold transition-colors">Liturgia API</a>
          </p>
        </footer>
      </div>
    </div>
  );
}