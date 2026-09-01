import { lazy, Suspense, useState, useEffect, useCallback } from "react";
import { fetchLiturgia, getLiturgicalColorClass, type LiturgiaData } from "@/lib/liturgy-api";
import LiturgyHeader from "@/components/liturgy/LiturgyHeader";
import ReadingCard from "@/components/liturgy/ReadingCard";
import GospelSection from "@/components/liturgy/GospelSection";
import PrayersSection from "@/components/liturgy/PrayersSection";
import AntiphonsSection from "@/components/liturgy/AntiphonsSection";
import LoadingSkeleton from "@/components/liturgy/LoadingSkeleton";
import ErrorDisplay from "@/components/liturgy/ErrorDisplay";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Church, Heart, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import MusicPlayer from "@/components/liturgy/MusicPlayer";

const WhatsAppRegistration = lazy(() => import("@/components/liturgy/WhatsAppRegistration"));

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
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao buscar a liturgia.");
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
    <div className="min-h-screen overflow-hidden bg-background selection:bg-primary/20">
      <LiturgyHeader
          data={liturgia.data}
          liturgia={liturgia.liturgia}
          cor={liturgia.cor}
          selectedDate={selectedDate}
          onDateChange={setSelectedDate}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
      />

      <main id="conteudo" className="relative mx-auto max-w-5xl px-4 pb-16 pt-40 sm:px-6 sm:pt-36 lg:px-8">
        <section className="mb-10 grid gap-3 md:grid-cols-3" aria-label="Apresentação da liturgia">
          {[
            { icon: BookOpen, title: "Palavra", text: "Leituras proclamadas na celebração de hoje." },
            { icon: Church, title: "Tradição", text: "Conteúdo conforme o calendário litúrgico romano." },
            { icon: Heart, title: "Oração", text: "Um momento diário de silêncio, fé e comunhão." },
          ].map(({ icon: Icon, title, text }) => (
            <div key={title} className="feature-card">
              <div className="grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 text-primary"><Icon size={21} /></div>
              <div>
                <h2 className="font-display text-lg font-bold">{title}</h2>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </section>

        <AnimatePresence mode="wait">
          <motion.div
            key={liturgia.data}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div id="leituras" className="scroll-mt-24">
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
            </div>

            <div id="evangelho" className="scroll-mt-24">
              <GospelSection readings={liturgia.leituras.evangelho} index={4} liturgicalColor={liturgia.cor} />
            </div>

            <div id="oracoes" className="scroll-mt-24">
              <PrayersSection oracoes={liturgia.oracoes} index={5} />
            </div>
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

            <div id="whatsapp" className="scroll-mt-24">
              <Suspense fallback={<div className="mx-auto my-8 h-80 max-w-3xl animate-pulse rounded-[2rem] bg-muted" aria-label="Carregando cadastro do WhatsApp" />}>
                <WhatsAppRegistration liturgicalColor={liturgia.cor} />
              </Suspense>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-14 flex justify-center gap-4">
          <Button
            onClick={handleShare}
            size="lg"
            className={`rounded-full px-8 py-6 font-bold shadow-lg transition hover:-translate-y-0.5 ${colorTheme.buttonBg}`}
          >
            <Share2 className="mr-2 h-5 w-5" />
            Compartilhar Liturgia
          </Button>
        </div>

      </main>

      <footer className="border-t border-border/60 bg-card/70 px-6 py-12">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-7 text-center md:flex-row md:text-left">
          <div className="flex items-center gap-4">
            <img src="/papal-keys.svg" alt="Chaves de São Pedro e tiara papal" className="h-16 w-16 object-contain" />
            <div>
              <p className="font-display text-lg font-bold">Liturgia Diária</p>
              <p className="mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">Projeto independente de espiritualidade católica. Não representa nem mantém vínculo oficial com o Vaticano ou a Santa Sé.</p>
            </div>
          </div>
          <div className="text-xs leading-relaxed text-muted-foreground">
            <p>Dados: <a href="https://liturgia.up.railway.app/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Liturgia API</a></p>
            <p className="mt-1">Símbolo: <a href="https://commons.wikimedia.org/wiki/File:Simple_papal_tiara_and_keys.svg" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Alekjds / Wikimedia Commons, CC BY-SA</a></p>
            <p className="mt-1">Música: <a href="https://commons.wikimedia.org/wiki/File:Schola_Gregoriana-Pater_Noster.ogg" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-foreground">Schola Gregoriana / Wikimedia Commons, CC BY-SA</a></p>
          </div>
        </div>
      </footer>
      <MusicPlayer />
    </div>
  );
}
