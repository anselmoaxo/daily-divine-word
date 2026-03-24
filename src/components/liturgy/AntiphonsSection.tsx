import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
        <span className="liturgy-title">Antífonas</span>
        <ChevronDown
          size={18}
          className={`text-muted-foreground transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="antiphons"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-6 md:px-6 md:pb-8 space-y-5">
              {antifonas.entrada && (
                <div>
                  <p className="text-sm font-semibold text-accent font-ui mb-2">Entrada</p>
                  <p className="font-body text-foreground/90 italic leading-[1.9]">{antifonas.entrada}</p>
                </div>
              )}
              {antifonas.comunhao && (
                <div>
                  <p className="text-sm font-semibold text-accent font-ui mb-2">Comunhão</p>
                  <p className="font-body text-foreground/90 italic leading-[1.9]">{antifonas.comunhao}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
