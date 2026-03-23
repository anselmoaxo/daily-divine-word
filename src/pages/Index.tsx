import { useState, useEffect, useCallback } from "react";
import { BookOpen, Music, ScrollText, Church, Share2 } from "lucide-react";
import { fetchLiturgia, inputValueToDate, type LiturgiaData } from "@/lib/liturgy-api";
import LiturgyHeader from "@/components/liturgy/LiturgyHeader";
import ReadingSection from "@/components/liturgy/ReadingSection";
import LoadingSkeleton from "@/components/liturgy/LoadingSkeleton";
import ErrorDisplay from "@/components/liturgy/ErrorDisplay";
import { motion } from "framer-motion";

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

        <div className="space-y-6">
          {/* Evangelho — always open by default */}
          <ReadingSection
            icon={<Church size={20} />}
            label="Evangelho"
            readings={leituras.evangelho}
            highlight
            defaultOpen
            index={0}
          />

          {/* Other readings — collapsed by default */}
          <ReadingSection
            icon={<BookOpen size={20} />}
            label="Primeira Leitura"
            readings={leituras.primeiraLeitura}
            index={1}
          />

          <ReadingSection
            icon={<Music size={20} />}
            label="Salmo Responsorial"
            readings={leituras.salmo}
            index={2}
          />

          <ReadingSection
            icon={<ScrollText size={20} />}
            label="Segunda Leitura"
            readings={leituras.segundaLeitura}
            index={3}
          />

          {/* Leituras Extras */}
          {leituras.extras && leituras.extras.length > 0 && (
            <ReadingSection
              icon={<BookOpen size={20} />}
              label="Leituras Extras"
              readings={leituras.extras}
              index={4}
            />
          )}

          {/* Orações — collapsed */}
          {(liturgia.oracoes.coleta || liturgia.oracoes.oferendas || liturgia.oracoes.comunhao) && (
            <motion.details
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="liturgy-section group"
            >
              <summary className="cursor-pointer flex items-center justify-between list-none font-ui">
                <span className="liturgy-title">Orações</span>
                <span className="text-muted-foreground transition-transform group-open:rotate-180">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="mt-5 space-y-6">
                {liturgia.oracoes.coleta && (
                  <div>
                    <p className="text-sm font-semibold text-accent font-ui mb-2">Oração da Coleta</p>
                    <p className="font-body text-foreground/90 leading-[1.9]">{liturgia.oracoes.coleta}</p>
                  </div>
                )}
                {liturgia.oracoes.oferendas && (
                  <div>
                    <p className="text-sm font-semibold text-accent font-ui mb-2">Sobre as Oferendas</p>
                    <p className="font-body text-foreground/90 leading-[1.9]">{liturgia.oracoes.oferendas}</p>
                  </div>
                )}
                {liturgia.oracoes.comunhao && (
                  <div>
                    <p className="text-sm font-semibold text-accent font-ui mb-2">Após a Comunhão</p>
                    <p className="font-body text-foreground/90 leading-[1.9]">{liturgia.oracoes.comunhao}</p>
                  </div>
                )}
              </div>
            </motion.details>
          )}

          {/* Antífonas — collapsed */}
          {(liturgia.antifonas?.entrada || liturgia.antifonas?.comunhao) && (
            <motion.details
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.55 }}
              className="liturgy-section group"
            >
              <summary className="cursor-pointer flex items-center justify-between list-none font-ui">
                <span className="liturgy-title">Antífonas</span>
                <span className="text-muted-foreground transition-transform group-open:rotate-180">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </summary>
              <div className="mt-5 space-y-5">
                {liturgia.antifonas?.entrada && (
                  <div>
                    <p className="text-sm font-semibold text-accent font-ui mb-2">Entrada</p>
                    <p className="font-body text-foreground/90 italic leading-[1.9]">{liturgia.antifonas.entrada}</p>
                  </div>
                )}
                {liturgia.antifonas?.comunhao && (
                  <div>
                    <p className="text-sm font-semibold text-accent font-ui mb-2">Comunhão</p>
                    <p className="font-body text-foreground/90 italic leading-[1.9]">{liturgia.antifonas.comunhao}</p>
                  </div>
                )}
              </div>
            </motion.details>
          )}
        </div>

        {/* Share button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
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
