import { motion } from "framer-motion";
import { getLiturgicalColorClass, type LeituraItem } from "@/lib/liturgy-api";
import AudioPlayer from "./AudioPlayer";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  readings: LeituraItem[];
  index: number;
  liturgicalColor: string;
}

/** Parses text into segments with superscript verse numbers */
function renderVerses(raw: string) {
  if (!raw) return null;
  
  // Regex to find verse numbers (e.g., "1", "26", "8,10")
  const parts = raw.split(/(\d{1,3}(?:,\d{1,2})?)/g);
  
  return parts.map((part, i) => {
    if (/^\d{1,3}(?:,\d{1,2})?$/.test(part)) {
      return <sup key={i} className="cnbb-verse-num">{part}</sup>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function ReadingCard({ label, readings, index, liturgicalColor }: Props) {
  if (!readings || readings.length === 0) return null;

  const colorTheme = getLiturgicalColorClass(liturgicalColor);
  const isPsalm = label.toLowerCase().includes("salmo");
  
  const sectionTitle = (() => {
    const l = label.toLowerCase();
    if (l.includes("primeira")) return "PRIMEIRA LEITURA";
    if (l.includes("segunda")) return "SEGUNDA LEITURA";
    if (l.includes("salmo")) return "SALMO RESPONSORIAL";
    return label.toUpperCase();
  })();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      className="cnbb-section"
    >
      <div className="flex flex-col items-center mb-6">
        <h2 className={cn("cnbb-section-title mb-2 transition-colors duration-300", colorTheme.accentText)}>
          {sectionTitle}
        </h2>
        
        {/* Botão de Ouvir (TTS) */}
        {readings.length > 0 && (
          <AudioPlayer 
            text={readings.map(r => `${r.referencia}. ${r.texto}`).join(" ")} 
            title={sectionTitle}
            colorTheme={colorTheme}
          />
        )}
      </div>

      {readings.map((reading, i) => (
        <div key={i} className={i > 0 ? "mt-10 pt-10 border-t border-border/30" : ""}>
          {/* Reference */}
          <p className={cn("text-center font-ui text-xs font-bold mb-6 tracking-[0.15em] transition-colors duration-300", colorTheme.accentText)}>
            {reading.referencia}
          </p>

          {/* Title/Theme */}
          {reading.titulo && (
            <p className="text-center font-display text-lg italic text-foreground/70 mb-8 px-4 leading-relaxed max-w-[680px] mx-auto">
              {reading.titulo}
            </p>
          )}

          {/* Psalm Refrain */}
          {isPsalm && reading.refrao && (
            <div className="psalm-refrain text-center max-w-lg mx-auto border-l-2 border-gold/40 pl-4 py-1 my-6">
              <span className={cn("font-bold mr-2 transition-colors duration-300", colorTheme.accentText)}>R.</span>
              {reading.refrao}
            </div>
          )}

          {/* Body Text */}
          <div className="reading-text px-4 md:px-0 max-w-[680px] mx-auto">
            {isPsalm ? (
              <div className="space-y-4">
                {reading.texto.split('\n').map((line, j) => (
                  <p key={j} className="psalm-verse pl-4 border-l border-border/20">
                    — {line.replace(/^—\s*/, '')}
                  </p>
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-wrap leading-[1.8] text-base md:text-[17px]">
                {renderVerses(reading.texto)}
              </div>
            )}
          </div>

          {/* Closing */}
          {!isPsalm && (
            <div className="mt-10 text-center pt-6">
              <div className="liturgy-divider mb-6" />
              <p className="font-body text-sm text-muted-foreground">— Palavra do Senhor.</p>
              <p className="font-body text-sm font-bold mt-1 text-foreground">— Graças a Deus.</p>
            </div>
          )}
        </div>
      ))}
    </motion.section>
  );
}