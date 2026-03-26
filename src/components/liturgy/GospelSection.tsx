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
      return <span key={i} className="cnbb-verse-num">{part}</span>;
    }
    return <span key={i}>{part}</span>;
  });
}

export default function GospelSection({ readings, index }: Props) {
  if (!readings || readings.length === 0) return null;
  const reading = readings[0];

  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.98 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="cnbb-section cnbb-gospel-highlight"
    >
      <h2 className="cnbb-section-title">EVANGELHO</h2>

      <div className="px-4 md:px-0">
        <p className="text-center font-ui text-sm font-bold text-primary mb-4 tracking-widest">
          {reading.referencia}
        </p>

        <div className="mb-8 text-center">
          <p className="font-display text-xl md:text-2xl font-bold text-foreground">
            <span className="text-primary mr-2">✠</span>
            {reading.titulo || "Proclamação do Evangelho de Jesus Cristo"}
          </p>
        </div>

        <div className="cnbb-text-body text-xl md:text-2xl leading-[1.9] font-medium">
          {renderVerses(reading.texto)}
        </div>

        <div className="mt-10 text-center border-t border-border/20 pt-6">
          <p className="font-body text-lg">— Palavra da Salvação.</p>
          <p className="font-body text-lg font-bold mt-1">— Glória a vós, Senhor.</p>
        </div>
      </div>
    </motion.section>
  );
}