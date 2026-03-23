import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  icon: ReactNode;
  label: string;
  readings: LeituraItem[];
  highlight?: boolean;
  index: number;
}

function formatText(text: string): string[] {
  if (!text) return [];
  return text.split(/\n|(?:— )/).filter(Boolean).map(t => t.trim());
}

export default function ReadingSection({ icon, label, readings, highlight, index }: Props) {
  const [copied, setCopied] = useState(false);

  if (!readings || readings.length === 0) return null;

  const allText = readings.map(r => `${r.referencia}\n${r.titulo || ""}\n${r.texto}`).join("\n\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={`liturgy-section relative ${highlight ? "border-accent/40 shadow-lg" : ""}`}
    >
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-4 right-4 p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        title="Copiar texto"
      >
        {copied ? <Check size={16} /> : <Copy size={16} />}
      </button>

      {/* Section header */}
      <div className="flex items-center gap-3 mb-4">
        <span className="text-accent">{icon}</span>
        <span className="liturgy-title">{label}</span>
      </div>

      {readings.map((reading, i) => (
        <div key={i} className={readings.length > 1 && i > 0 ? "mt-6 pt-6 border-t border-border" : ""}>
          <p className="liturgy-reference mb-3">{reading.referencia}</p>
          {reading.titulo && (
            <p className="font-display text-sm text-muted-foreground italic mb-4">{reading.titulo}</p>
          )}

          {/* Refrain for psalms */}
          {reading.refrao && (
            <div className="liturgy-refrain my-4 px-4 py-3 rounded-lg bg-secondary">
              ℟ {reading.refrao}
            </div>
          )}

          {/* Text */}
          <div className="liturgy-verse font-body text-foreground/90">
            {formatText(reading.texto).map((paragraph, j) => (
              <p key={j} className="mb-3 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      ))}
    </motion.section>
  );
}
