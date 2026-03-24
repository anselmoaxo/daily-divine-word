import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
  ].filter(i => i.text);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="bg-card rounded-xl border border-border overflow-hidden shadow-sm"
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 md:p-6 text-left hover:bg-secondary/30 transition-colors"
        aria-expanded={open}
      >
        <span className="liturgy-title">Orações</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="prayers"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 md:px-6 md:pb-8 space-y-6">
              {items.map((item, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-accent font-ui mb-2">{item.label}</p>
                  <p className="font-body text-foreground/90 leading-[1.9]">{item.text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
