import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  icon: ReactNode;
  label: string;
  readings: LeituraItem[];
  highlight?: boolean;
  defaultOpen?: boolean;
  index: number;
}

function formatText(text: string): string[] {
  if (!text) return [];
  return text.split(/\n|(?:— )/).filter(Boolean).map(t => t.trim());
}

export default function ReadingSection({ icon, label, readings, highlight, defaultOpen = false, index }: Props) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(defaultOpen);

  if (!readings || readings.length === 0) return null;

  const allText = readings.map(r => `${r.referencia}\n${r.titulo || ""}\n${r.texto}`).join("\n\n");

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      {/* Clickable header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3">
          <span className="text-accent">{icon}</span>
          <span className="liturgy-title">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Copy button */}
          <span
            role="button"
            onClick={handleCopy}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copiar texto"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </span>
          <span className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </span>
        </div>
      </button>

      {/* Preview: show reference even when collapsed */}
      {!open && readings.length > 0 && (
        <p className="liturgy-reference mt-3">{readings[0].referencia}</p>
      )}

      {/* Expandable content */}
      {open && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
          className="mt-5"
        >
          {readings.map((reading, i) => (
            <div key={i} className={readings.length > 1 && i > 0 ? "mt-8 pt-8 border-t border-border" : ""}>
              <p className="liturgy-reference mb-4">{reading.referencia}</p>
              {reading.titulo && (
                <p className="font-display text-sm text-muted-foreground italic mb-5">{reading.titulo}</p>
              )}

              {/* Refrain for psalms */}
              {reading.refrao && (
                <div className="liturgy-refrain my-5 px-4 py-3 rounded-lg bg-secondary">
                  ℟ {reading.refrao}
                </div>
              )}

              {/* Text with generous spacing */}
              <div className="liturgy-verse font-body text-foreground/90 space-y-4">
                {formatText(reading.texto).map((paragraph, j) => (
                  <p key={j} className="leading-[1.9] text-base md:text-lg">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </motion.div>
      )}
    </motion.section>
  );
}
