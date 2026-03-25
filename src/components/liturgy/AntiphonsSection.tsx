import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  antifonas: {
    entrada?: string;
    comunhao?: string;
  };
  index: number;
}

export default function AntiphonsSection({ antifonas, index }: Props) {
  const [open, setOpen] = useState(false);
  const hasContent = antifonas?.entrada || antifonas?.comunhao;
  if (!hasContent) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="cnbb-section"
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left" aria-expanded={open}>
        <h2 className="cnbb-section-title">ANTÍFONAS</h2>
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          {antifonas.entrada && (
            <div>
              <p className="cnbb-prayer-label">Entrada</p>
              <p className="font-body text-foreground/90 italic leading-[1.8]">{antifonas.entrada}</p>
            </div>
          )}
          {antifonas.comunhao && (
            <div>
              <p className="cnbb-prayer-label">Comunhão</p>
              <p className="font-body text-foreground/90 italic leading-[1.8]">{antifonas.comunhao}</p>
            </div>
          )}
        </div>
      )}
    </motion.section>
  );
}
