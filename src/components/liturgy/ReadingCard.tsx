import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check, ChevronDown } from "lucide-react";
import { useState, type ReactNode } from "react";
import type { LeituraItem } from "@/lib/liturgy-api";
import VerseList from "./Verse";

interface Props {
  icon: ReactNode;
  label: string;
  readings: LeituraItem[];
  highlight?: boolean;
  defaultOpen?: boolean;
  index: number;
}

export default function ReadingCard({ icon, label, readings, highlight, defaultOpen = false, index }: Props) {
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
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`bg-card rounded-xl border border-border overflow-hidden transition-shadow duration-300 ${
        highlight ? "border-accent/30 shadow-md ring-1 ring-accent/10" : "shadow-sm"
      }`}
      aria-label={`Seção: ${label}`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 md:p-6 text-left hover:bg-secondary/30 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <span className="text-accent flex-shrink-0">{icon}</span>
          <div>
            <span className="liturgy-title block">{label}</span>
            {!open && readings.length > 0 && (
              <span className="liturgy-reference text-xs mt-0.5 block">{readings[0].referencia}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span
            role="button"
            onClick={handleCopy}
            className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            title="Copiar texto completo"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </span>
          <ChevronDown
            size={18}
            className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* Content */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 md:px-6 md:pb-8">
              {readings.map((reading, i) => (
                <div key={i} className={readings.length > 1 && i > 0 ? "mt-8 pt-8 border-t border-border" : ""}>
                  <p className="liturgy-reference mb-2">{reading.referencia}</p>
                  {reading.titulo && (
                    <p className="font-display text-sm text-muted-foreground italic mb-4">{reading.titulo}</p>
                  )}

                  {/* Refrain for psalms */}
                  {reading.refrao && (
                    <div className="my-5 px-4 py-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
                      <span className="font-display text-lg md:text-xl text-accent font-semibold italic">
                        ℟ {reading.refrao}
                      </span>
                    </div>
                  )}

                  {/* Verses */}
                  <VerseList text={reading.texto} />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
