import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Minus, Copy, Check } from "lucide-react";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  readings: LeituraItem[];
  index: number;
}

/**
 * Parses gospel text into verse segments.
 * Detects patterns like "26o anjo" → verse 26.
 * Each verse gets its own block with the number on the left.
 */
function parseVerses(raw: string): { num: string; text: string }[] {
  if (!raw) return [];

  // Insert line breaks before verse numbers: "26o" or "8,10porque"
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

/** Split verse text into lines at natural phrase boundaries for CNBB-style display */
function splitIntoLines(text: string): string[] {
  // Split on periods, semicolons, or long phrases
  const parts = text.split(/(?<=[.;!?])\s+|(?<=[""])\s+/);
  return parts.filter(Boolean).map((p) => p.trim());
}

export default function GospelSection({ readings, index }: Props) {
  const [fontScale, setFontScale] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!readings || readings.length === 0) return null;

  const reading = readings[0];
  const verses = parseVerses(reading.texto);
  const allText = `${reading.referencia}\n${reading.titulo || ""}\n${reading.texto}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="cnbb-section"
    >
      {/* Section title */}
      <h2 className="cnbb-section-title">EVANGELHO</h2>

      {/* Antiphon / theme - italic right-aligned */}
      <p className="cnbb-antiphon">
        <em>Eis que conceberás e darás à luz um filho.</em>
      </p>

      {/* Title with cross */}
      <div className="mb-6">
        <p className="font-body text-foreground text-base md:text-lg">
          <span className="text-primary font-bold mr-1">✠</span>
          {reading.titulo || "Proclamação do Evangelho de Jesus Cristo"}{" "}
          <span className="cnbb-ref-inline">{reading.referencia}</span>
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setFontScale((s) => Math.max(0.85, s - 0.1))} className="cnbb-btn" aria-label="Diminuir fonte">
          A<Minus size={10} className="ml-0.5" />
        </button>
        <button onClick={() => setFontScale((s) => Math.min(1.4, s + 0.1))} className="cnbb-btn" aria-label="Aumentar fonte">
          A<Plus size={10} className="ml-0.5" />
        </button>
        <button onClick={handleCopy} className="cnbb-btn ml-auto">
          {copied ? <><Check size={14} /> Copiado</> : <><Copy size={14} /> Copiar</>}
        </button>
      </div>

      {/* Gospel body - CNBB verse style */}
      <div className="cnbb-text-body" style={{ fontSize: `${fontScale}rem` }}>
        {verses.map((verse, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.04, duration: 0.3 }}
            className="cnbb-verse-block"
          >
            {verse.num && (
              <span className="cnbb-verse-num">{verse.num}</span>
            )}
            <div className={verse.num ? "cnbb-verse-text" : "cnbb-verse-text cnbb-verse-no-num"}>
              {splitIntoLines(verse.text).map((line, j) => (
                <span key={j} className="block">
                  {line}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Closing */}
      <div className="mt-8 pt-4">
        <p className="font-body text-foreground text-base">— Palavra da Salvação.</p>
        <p className="font-body text-foreground text-base font-semibold mt-2">— Glória a vós, Senhor.</p>
      </div>
    </motion.section>
  );
}
