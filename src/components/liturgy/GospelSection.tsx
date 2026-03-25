import { useState } from "react";
import { motion } from "framer-motion";
import { Cross, Copy, Check, Plus, Minus, BookOpen } from "lucide-react";
import type { LeituraItem } from "@/lib/liturgy-api";

interface Props {
  readings: LeituraItem[];
  index: number;
}

/**
 * Process raw gospel text into structured paragraphs.
 * - Splits on verse numbers (e.g. "26o anjo..." or "26 o anjo...")
 * - Groups into readable paragraphs of 2-3 verses
 * - Detects Jesus' speech (text within quotes after Jesus-related context)
 */
function processGospelText(raw: string): { type: "paragraph" | "jesus-speech"; text: string; verseNum?: string }[] {
  if (!raw) return [];

  // Split by verse numbers: pattern like "26o" or "26 o" at boundaries
  const versePattern = /(\d{1,3})([a-záàâãéèêíïóôõúüç""])/gi;
  const withMarkers = raw.replace(versePattern, "\n%%VERSE:$1%% $2");

  // Also handle "8,10porque" pattern
  const commaVersePattern = /(\d{1,2},\d{1,2})([a-záàâãéèêíïóôõúüç])/gi;
  const processed = withMarkers.replace(commaVersePattern, "\n%%VERSE:$1%% $2");

  const lines = processed.split("\n").filter((l) => l.trim());

  const segments: { verseNum: string; text: string }[] = [];

  for (const line of lines) {
    const markerMatch = line.match(/^%%VERSE:(.+?)%%\s*(.*)$/);
    if (markerMatch) {
      segments.push({ verseNum: markerMatch[1], text: markerMatch[2].trim() });
    } else {
      // Continuation or intro text
      if (segments.length > 0) {
        segments[segments.length - 1].text += " " + line.trim();
      } else {
        segments.push({ verseNum: "", text: line.trim() });
      }
    }
  }

  // Group into paragraphs of 2-4 verses for readability
  const paragraphs: { type: "paragraph" | "jesus-speech"; text: string; verseNum?: string }[] = [];
  let currentGroup: string[] = [];
  let currentVerses: string[] = [];

  const flushGroup = () => {
    if (currentGroup.length > 0) {
      const fullText = currentGroup.join(" ");
      // Check if this contains direct speech patterns (quotes)
      const hasQuotes = /[""\u201C]/.test(fullText) || /disse:/.test(fullText);
      paragraphs.push({
        type: "paragraph",
        text: fullText,
        verseNum: currentVerses[0] || undefined,
      });
      currentGroup = [];
      currentVerses = [];
    }
  };

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i];
    currentGroup.push(seg.text);
    if (seg.verseNum) currentVerses.push(seg.verseNum);

    // Flush every 3 verses or at natural breaks (period + new sentence)
    if (currentGroup.length >= 3) {
      flushGroup();
    }
  }
  flushGroup();

  return paragraphs;
}

/**
 * Highlights verse numbers in bold and Jesus' speech in wine color
 */
function renderFormattedText(text: string) {
  // Highlight verse numbers that appear inline
  const parts: (string | JSX.Element)[] = [];
  // Match verse numbers like "26 " at start or inline
  const regex = /(\d{1,3}(?:,\d{1,2})?)\s/g;
  let lastIdx = 0;
  let match;
  let key = 0;

  const working = text;
  while ((match = regex.exec(working)) !== null) {
    // Only highlight if it looks like a verse number (reasonable range)
    const num = parseInt(match[1]);
    if (num > 0 && num < 200 && match.index < 4) {
      if (match.index > lastIdx) {
        parts.push(working.slice(lastIdx, match.index));
      }
      parts.push(
        <sup key={key++} className="font-ui text-[0.65em] font-bold text-accent mr-0.5 select-none">
          {match[1]}
        </sup>
      );
      lastIdx = match.index + match[0].length;
    }
  }
  parts.push(working.slice(lastIdx));

  // Now process quotes for Jesus' words - wrap quoted text in wine color
  return processQuotes(parts);
}

function processQuotes(parts: (string | JSX.Element)[]): (string | JSX.Element)[] {
  const result: (string | JSX.Element)[] = [];
  let qKey = 1000;

  for (const part of parts) {
    if (typeof part !== "string") {
      result.push(part);
      continue;
    }

    // Split by quote marks and style quoted text
    const quoteRegex = /(["""])(.*?)(["""])/g;
    let lastIdx = 0;
    let match;

    while ((match = quoteRegex.exec(part)) !== null) {
      if (match.index > lastIdx) {
        result.push(part.slice(lastIdx, match.index));
      }
      result.push(
        <span key={qKey++} className="text-wine dark:text-wine font-medium">
          {match[1]}{match[2]}{match[3]}
        </span>
      );
      lastIdx = match.index + match[0].length;
    }
    result.push(part.slice(lastIdx));
  }

  return result;
}

export default function GospelSection({ readings, index }: Props) {
  const [fontScale, setFontScale] = useState(1);
  const [readingMode, setReadingMode] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!readings || readings.length === 0) return null;

  const reading = readings[0]; // Gospel is typically one reading
  const paragraphs = processGospelText(reading.texto);

  const allText = readings.map((r) => `${r.referencia}\n${r.titulo || ""}\n${r.texto}`).join("\n\n");

  const handleCopy = async () => {
    await navigator.clipboard.writeText(allText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const adjustFont = (delta: number) => {
    setFontScale((prev) => Math.min(1.4, Math.max(0.85, prev + delta)));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className={`gospel-section overflow-hidden transition-all duration-300 ${
        readingMode ? "gospel-reading-mode" : ""
      }`}
      aria-label="Evangelho do Dia"
    >
      {/* Decorative top bar */}
      <div className="gospel-top-bar" />

      <div className="px-5 py-6 md:px-8 md:py-8">
        {/* Section title with cross icon */}
        <div className="text-center mb-6">
          <Cross className="mx-auto mb-3 text-accent" size={28} strokeWidth={1.2} />
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Evangelho do Dia
          </h2>
          <div className="gospel-divider" />
        </div>

        {/* Aclamação */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <p className="font-display text-base md:text-lg text-muted-foreground italic">
            — Glória a Cristo, Palavra eterna do Pai!
          </p>
        </motion.div>

        {/* Reference */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-2"
        >
          <span className="gospel-reference">{reading.referencia}</span>
        </motion.div>

        {/* Título litúrgico */}
        {reading.titulo && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="text-center font-body text-sm md:text-base text-muted-foreground mb-6"
          >
            {reading.titulo}
          </motion.p>
        )}

        {/* Glória a vós, Senhor */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center mb-8"
        >
          <p className="font-display text-base font-semibold text-primary">
            — Glória a vós, Senhor.
          </p>
        </motion.div>

        {/* Controls bar */}
        <div className="flex items-center justify-center gap-2 mb-8 flex-wrap">
          <button
            onClick={() => adjustFont(-0.1)}
            className="gospel-control-btn"
            aria-label="Diminuir fonte"
            title="Diminuir fonte"
          >
            <Minus size={14} />
            <span className="text-xs">A</span>
          </button>
          <button
            onClick={() => adjustFont(0.1)}
            className="gospel-control-btn"
            aria-label="Aumentar fonte"
            title="Aumentar fonte"
          >
            <Plus size={14} />
            <span className="text-sm font-bold">A</span>
          </button>
          <button
            onClick={() => setReadingMode(!readingMode)}
            className={`gospel-control-btn ${readingMode ? "gospel-control-active" : ""}`}
            aria-label="Modo leitura"
            title="Modo leitura"
          >
            <BookOpen size={14} />
            <span className="text-xs">Leitura</span>
          </button>
          <button
            onClick={handleCopy}
            className="gospel-control-btn"
            aria-label="Copiar evangelho"
            title="Copiar texto"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="text-xs">{copied ? "Copiado" : "Copiar"}</span>
          </button>
        </div>

        {/* Gospel body text */}
        <div className="gospel-text-container" style={{ fontSize: `${fontScale}rem` }}>
          {paragraphs.map((para, i) => (
            <motion.p
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 + i * 0.06, duration: 0.4 }}
              className="gospel-paragraph group"
            >
              {renderFormattedText(para.text)}
            </motion.p>
          ))}
        </div>

        {/* Closing liturgical text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-10"
        >
          <div className="gospel-divider" />

          <div className="text-center space-y-3 mt-6">
            <p className="font-display text-base md:text-lg text-foreground italic">
              — Palavra da Salvação.
            </p>
            <p className="font-display text-base md:text-lg font-semibold text-primary">
              — Glória a vós, Senhor.
            </p>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}
