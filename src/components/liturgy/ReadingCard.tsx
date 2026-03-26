import { motion } from "framer-motion";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  label: string;
  readings: LeituraItem[];
  index: number;
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

export default function ReadingCard({ label, readings, index }: Props) {
  if (!readings || readings.length === 0) return null;

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
      <h2 className="cnbb-section-title">{sectionTitle}</h2>

      {readings.map((reading, i) => (
        <div key={i} className={i > 0 ? "mt-10 pt-10 border-t border-border/30" : ""}>
          {/* Reference */}
          <p className="text-center font-ui text-xs font-bold text-gold mb-6 tracking-[0.15em]">
            {reading.referencia}
          </p>

          {/* Title/Theme */}
          {reading.titulo && (
            <p className="text-center font-display text-lg italic text-foreground/70 mb-8 px-4 leading-relaxed">
              {reading.titulo}
            </p>
          )}

          {/* Psalm Refrain */}
          {isPsalm && reading.refrao && (
            <div className="psalm-refrain text-center max-w-lg mx-auto">
              <span className="text-gold mr-2">R.</span>
              {reading.refrao}
            </div>
          )}

          {/* Body Text */}
          <div className="reading-text px-4 md:px-0">
            {isPsalm ? (
              <div className="space-y-4">
                {reading.texto.split('\n').map((line, j) => (
                  <p key={j} className="psalm-verse">
                    — {line.replace(/^—\s*/, '')}
                  </p>
                ))}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">
                {renderVerses(reading.texto)}
              </div>
            )}
          </div>

          {/* Closing */}
          {!isPsalm && (
            <div className="mt-10 text-center pt-6">
              <div className="liturgy-divider mb-6" />
              <p className="font-body text-sm">— Palavra do Senhor.</p>
              <p className="font-body text-sm font-bold mt-1">— Graças a Deus.</p>
            </div>
          )}
        </div>
      ))}
    </motion.section>
  );
}