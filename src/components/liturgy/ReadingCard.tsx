import { motion } from "framer-motion";
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

/** Parse text into verse segments with numbers */
function parseVerses(raw: string): { num: string; text: string }[] {
  if (!raw) return [];
  let processed = raw.replace(/(\d{1,3})([a-záàâãéèêíïóôõúüçA-ZÁÀÂÃÉÈÊÍÏÓÔÕÚÜÇ""])/g, "\n$1 $2");
  processed = processed.replace(/(\d{1,2},\d{1,2})([a-záàâãéèêíïóôõúüç])/g, "\n$1 $2");
  const lines = processed.split("\n").filter((l) => l.trim());
  const verses: { num: string; text: string }[] = [];
  for (const line of lines) {
    const match = line.trim().match(/^(\d{1,3}(?:,\d{1,2})?)\s+(.*)$/);
    if (match) {
      verses.push({ num: match[1], text: match[2].trim() });
    } else if (verses.length > 0) {
      verses[verses.length - 1].text += " " + line.trim();
    } else {
      verses.push({ num: "", text: line.trim() });
    }
  }
  return verses;
}

function splitIntoLines(text: string): string[] {
  const parts = text.split(/(?<=[.;!?])\s+|(?<=[""])\s+/);
  return parts.filter(Boolean).map((p) => p.trim());
}

export default function ReadingCard({ label, readings, index }: Props) {
  const [open, setOpen] = useState(true);

  if (!readings || readings.length === 0) return null;

  // Map label to CNBB-style title
  const sectionTitle = (() => {
    const l = label.toLowerCase();
    if (l.includes("primeira")) return "PRIMEIRA LEITURA";
    if (l.includes("segunda")) return "SEGUNDA LEITURA";
    if (l.includes("salmo")) return "SALMO RESPONSORIAL";
    if (l.includes("extra")) return "LEITURAS EXTRAS";
    return label.toUpperCase();
  })();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="cnbb-section"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full text-left"
        aria-expanded={open}
      >
        <h2 className="cnbb-section-title">{sectionTitle}</h2>
      </button>

      {open && readings.map((reading, i) => (
        <div key={i} className={i > 0 ? "mt-8 pt-6 border-t border-border" : ""}>
          {/* Antiphon / theme */}
          {reading.titulo && (
            <p className="cnbb-antiphon">
              <em>{reading.titulo}</em>
            </p>
          )}

          {/* Reference */}
          <p className="font-body text-foreground text-base mb-4">
            {reading.titulo ? "" : "Leitura "}{" "}
            <span className="cnbb-ref-inline">{reading.referencia}</span>
          </p>

          {/* Refrain for psalms */}
          {reading.refrao && (
            <div className="cnbb-refrain">
              <p className="font-body font-semibold">
                — {reading.refrao}
              </p>
              <p className="font-body font-bold mt-2">
                — {reading.refrao}
              </p>
            </div>
          )}

          {/* Verses in CNBB style */}
          <div className="cnbb-text-body">
            {parseVerses(reading.texto).map((verse, vi) => (
              <div key={vi} className="cnbb-verse-block">
                {verse.num && <span className="cnbb-verse-num">{verse.num}</span>}
                <div className={verse.num ? "cnbb-verse-text" : "cnbb-verse-text cnbb-verse-no-num"}>
                  {splitIntoLines(verse.text).map((line, j) => (
                    <span key={j} className="block">{line}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Closing for readings */}
          {!label.toLowerCase().includes("salmo") && (
            <div className="mt-6">
              <p className="font-body text-foreground text-base">— Palavra do Senhor.</p>
              <p className="font-body text-foreground text-base font-semibold mt-1">— Graças a Deus.</p>
            </div>
          )}
        </div>
      ))}
    </motion.section>
  );
}
