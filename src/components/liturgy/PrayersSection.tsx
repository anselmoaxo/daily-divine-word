import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  oracoes: {
    coleta: string;
    oferendas: string;
    comunhao: string;
  };
  index: number;
}

export default function PrayersSection({ oracoes, index }: Props) {
  const [open, setOpen] = useState(false);
  const hasContent = oracoes.coleta || oracoes.oferendas || oracoes.comunhao;
  if (!hasContent) return null;

  const items = [
    { label: "Oração da Coleta", text: oracoes.coleta },
    { label: "Sobre as Oferendas", text: oracoes.oferendas },
    { label: "Após a Comunhão", text: oracoes.comunhao },
  ].filter((i) => i.text);

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="cnbb-section"
    >
      <button onClick={() => setOpen(!open)} className="w-full text-left" aria-expanded={open}>
        <h2 className="cnbb-section-title">ORAÇÕES</h2>
      </button>

      {open && (
        <div className="mt-4 space-y-6">
          {items.map((item, i) => (
            <div key={i}>
              <p className="cnbb-prayer-label">{item.label}</p>
              <p className="font-body text-foreground/90 leading-[1.8] text-base">{item.text}</p>
            </div>
          ))}
        </div>
      )}
    </motion.section>
  );
}
