import { motion } from "framer-motion";
import { getLiturgicalColorClass, type LeituraItem } from "@/lib/liturgy-api";
import AudioPlayer from "./AudioPlayer";
import { cn } from "@/lib/utils";

interface Props {
  readings: LeituraItem[];
  index: number;
  liturgicalColor: string;
}

function renderVerses(raw: string) {
  if (!raw) return null;
  const parts = raw.split(/(\d{1,3}(?:,\d{1,2})?)/g);
  return parts.map((part, i) => {
    if (/^\d{1,3}(?:,\d{1,2})?$/.test(part)) {
      return <sup key={i} className="cnbb-verse-num">{part}</sup>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function GospelSection({ readings, index, liturgicalColor }: Props) {
  if (!readings || readings.length === 0) return null;
  const reading = readings[0];
  const colorTheme = getLiturgicalColorClass(liturgicalColor);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="cnbb-section"
    >
      <div className="flex flex-col items-center mb-6">
        <h2 className={cn("cnbb-section-title mb-2 transition-colors duration-300", colorTheme.accentText)}>
          EVANGELHO
        </h2>
        
        {/* Botão de Ouvir (TTS) */}
        <AudioPlayer 
          text={`${reading.referencia}. ${reading.titulo || ""}. ${reading.texto}`} 
          title="Evangelho"
          colorTheme={colorTheme}
        />
      </div>

      <div className={cn(
        "gospel-container border-l-[3px] pl-6 py-4 my-10 rounded-r-lg max-w-[680px] mx-auto transition-all duration-300",
        colorTheme.cardBorder,
        colorTheme.bg
      )}>
        <p className={cn("font-ui text-xs font-bold mb-4 tracking-[0.15em] transition-colors duration-300", colorTheme.accentText)}>
          {reading.referencia}
        </p>

        <div className="mb-8">
          <p className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
            <span className={cn("mr-3 transition-colors duration-300", colorTheme.accentText)}>✠</span>
            {reading.titulo || "Proclamação do Evangelho de Jesus Cristo"}
          </p>
        </div>

        <div className="reading-text text-[17px] md:text-[18px] font-medium max-w-none">
          {renderVerses(reading.texto)}
        </div>

        <div className="mt-10 pt-6 border-t border-border/20">
          <p className="font-body text-base text-muted-foreground">— Palavra da Salvação.</p>
          <p className="font-body text-base font-bold mt-1 text-foreground">— Glória a vós, Senhor.</p>
        </div>
      </div>
    </motion.section>
  );
}