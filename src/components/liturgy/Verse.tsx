import React, { useState } from "react";
import { Copy, Check } from "lucide-react";

interface VerseData {
  number: number | null;
  text: string;
}

/**
 * Parses raw liturgical text into individual verses.
 * Detects patterns like "1. Text", "1 Text", or numbered lines.
 * Falls back to paragraph splitting if no verse numbers found.
 */
export function parseVerses(text: string): VerseData[] {
  if (!text) return [];

  // Try to detect numbered verses: "1. text" or "1 text" at line starts
  const lines = text.split(/\n/).filter(l => l.trim());
  const numberedPattern = /^(\d{1,3})[.\s)\-–]\s*(.+)/;
  
  const parsed: VerseData[] = [];
  let hasNumbers = false;

  for (const line of lines) {
    const match = line.trim().match(numberedPattern);
    if (match) {
      hasNumbers = true;
      parsed.push({ number: parseInt(match[1]), text: match[2].trim() });
    } else {
      // Could be continuation of previous verse or unnumbered paragraph
      parsed.push({ number: null, text: line.trim() });
    }
  }

  // If we found numbered verses, keep them; otherwise split by paragraphs
  if (!hasNumbers) {
    const paragraphs = text.split(/\n{2,}|(?:— )/).filter(Boolean).map(t => t.trim());
    if (paragraphs.length <= 1) {
      // Split long single block by sentences for readability
      const sentences = text.split(/\n/).filter(Boolean).map(t => t.trim());
      return sentences.map((s, i) => ({ number: i + 1, text: s }));
    }
    return paragraphs.map((p, i) => ({ number: i + 1, text: p }));
  }

  return parsed;
}

interface VerseProps {
  verse: VerseData;
  highlighted: boolean;
  onHighlight: () => void;
}

export function VerseItem({ verse, highlighted, onHighlight }: VerseProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await navigator.clipboard.writeText(verse.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      onClick={onHighlight}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onHighlight()}
      className={`group flex gap-3 py-3 px-3 rounded-lg cursor-pointer transition-all duration-200 ${
        highlighted
          ? "bg-accent/10 border-l-2 border-accent"
          : "hover:bg-secondary/50 border-l-2 border-transparent"
      }`}
      aria-label={`Versículo ${verse.number || ""}: ${verse.text.substring(0, 50)}...`}
    >
      {verse.number !== null && (
        <span className="font-ui text-xs font-bold text-accent min-w-[1.5rem] pt-1 select-none">
          {verse.number}
        </span>
      )}
      <p className="font-body text-foreground/90 leading-[1.9] text-base md:text-lg flex-1">
        {verse.text}
      </p>
      <button
        onClick={handleCopy}
        className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground transition-all self-start"
        aria-label="Copiar versículo"
      >
        {copied ? <Check size={14} /> : <Copy size={14} />}
      </button>
    </div>
  );
}

interface VerseListProps {
  text: string;
}

export default function VerseList({ text }: VerseListProps) {
  const [highlightedIdx, setHighlightedIdx] = useState<number | null>(null);
  const verses = parseVerses(text);

  return (
    <div className="space-y-1">
      {verses.map((verse, i) => (
        <VerseItem
          key={i}
          verse={verse}
          highlighted={highlightedIdx === i}
          onHighlight={() => setHighlightedIdx(highlightedIdx === i ? null : i)}
        />
      ))}
    </div>
  );
}