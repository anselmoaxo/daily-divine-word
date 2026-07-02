"use client";

import React, { useState, useEffect } from "react";
import { Play, Square, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface AudioPlayerProps {
  text: string;
  title: string;
  colorTheme: {
    accentText: string;
    buttonBg: string;
  };
}

export default function AudioPlayer({ text, title, colorTheme }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [synth, setSynth] = useState<SpeechSynthesis | null>(null);
  const [utterance, setUtterance] = useState<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      setSynth(window.speechSynthesis);
    }
  }, []);

  const cleanTextForSpeech = (rawText: string) => {
    // Remove números de versículos e caracteres especiais para uma leitura fluida
    return rawText
      .replace(/\d+(?:,\d+)?/g, "") // Remove versículos
      .replace(/—/g, "")
      .replace(/✠/g, "")
      .trim();
  };

  const handlePlay = () => {
    if (!synth) {
      toast.error("Seu navegador não suporta leitura de texto em voz alta.");
      return;
    }

    if (isPlaying) {
      synth.cancel();
      setIsPlaying(false);
      return;
    }

    // Cancela qualquer leitura em andamento
    synth.cancel();

    const textToRead = `${title}. ${cleanTextForSpeech(text)}`;
    const newUtterance = new SpeechSynthesisUtterance(textToRead);
    
    // Configura voz em Português do Brasil
    newUtterance.lang = "pt-BR";
    newUtterance.rate = 0.95; // Velocidade ligeiramente mais lenta e solene

    newUtterance.onend = () => {
      setIsPlaying(false);
    };

    newUtterance.onerror = () => {
      setIsPlaying(false);
    };

    setUtterance(newUtterance);
    setIsPlaying(true);
    synth.speak(newUtterance);
  };

  const handleStop = () => {
    if (synth) {
      synth.cancel();
      setIsPlaying(false);
    }
  };

  // Garante que o áudio pare se o componente for desmontado
  useEffect(() => {
    return () => {
      if (synth) {
        synth.cancel();
      }
    };
  }, [synth]);

  return (
    <div className="flex items-center gap-2 mt-2">
      <Button
        onClick={handlePlay}
        variant="ghost"
        size="sm"
        className={`h-8 px-3 text-xs gap-1.5 rounded-full transition-all ${
          isPlaying 
            ? "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-950/30 dark:text-red-400" 
            : `hover:bg-secondary/60 ${colorTheme.accentText}`
        }`}
        title={isPlaying ? "Pausar leitura" : "Ouvir leitura"}
      >
        {isPlaying ? <VolumeX size={14} /> : <Volume2 size={14} />}
        {isPlaying ? "Parar" : "Ouvir"}
      </Button>
      
      {isPlaying && (
        <Button
          onClick={handleStop}
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          title="Parar leitura"
        >
          <Square size={12} fill="currentColor" />
        </Button>
      )}
    </div>
  );
}