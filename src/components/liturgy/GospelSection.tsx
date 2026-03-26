import { motion } from "framer-motion";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  readings: LeituraItem[];
  index: number;
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

export default function GospelSection({ readings, index }: Props) {
  if (!readings || readings.length === 0) return null;
  const reading = readings[0];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="cnbb-section"
    >
      <h2 className="cnbb-section-title">EVANGELHO</h2>

      <div className="gospel-container">
        <p className="font-ui text-xs font-bold text-gold mb-4 tracking-[0.15em]">
          {reading.referencia}
        </p>

        <div className="mb-8">
          <p className="font-display text-xl md:text-2xl font-bold text-foreground leading-tight">
            <span className="text-gold mr-3">✠</span>
            {reading.titulo || "Proclamação do Evangelho de Jesus Cristo"}
          </p>
        </div>

        <div className="reading-text text-[17px] md:text-[18px] font-medium">
          {renderVerses(reading.texto)}
        </div>

        <div className="mt-10 pt-6 border-t border-gold/10">
          <p className="font-body text-base">— Palavra da Salvação.</p>
          <p className="font-body text-base font-bold mt-1">— Glória a vós, Senhor.</p>
        </div>
      </div>
    </motion.section>
  );
}