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
      return <span key={i} className="cnbb-verse-num">{part}</span>;
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
          <p className="text-center font-ui text-sm font-bold text-primary mb-6 tracking-widest">
            {reading.referencia}
          </p>

          {/* Title/Theme */}
          {reading.titulo && (
            <p className="text-center font-display text-lg md:text-xl italic text-foreground/70 mb-8 px-4">
              {reading.titulo}
            </p>
          )}

          {/* Psalm Refrain */}
          {isPsalm && reading.refrao && (
            <div className="cnbb-refrain">
              <span className="cnbb-refrain-label">R. (Resposta):</span>
              <p className="cnbb-refrain-text">{reading.refrao}</p>
            </div>
          )}

          {/* Body Text */}
          <div className="cnbb-text-body px-4 md:px-0">
            {isPsalm ? (
              <div className="space-y-6 italic">
                {reading.texto.split('\n').map((line, j) => (
                  <p key={j} className={line.startsWith('—') ? "pl-4" : ""}>
                    {line}
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
            <div className="mt-8 text-center border-t border-border/20 pt-6">
              <p className="font-body text-base">— Palavra do Senhor.</p>
              <p className="font-body text-base font-bold mt-1">— Graças a Deus.</p>
            </div>
          )}
        </div>
      ))}
    </motion.section>
  );
}