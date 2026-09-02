import { useEffect, useRef, useState } from "react";
import { Music2, Pause, Play } from "lucide-react";

/** Player discreto de canto gregoriano. O navegador exige uma ação do usuário para liberar áudio. */
export default function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.28;
    const sync = () => setPlaying(!audio.paused);
    let startedAfterInteraction = false;
    const startOnInteraction = () => {
      startedAfterInteraction = true;
      void audio.play().catch(() => undefined);
    };
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    // Tenta iniciar na entrada; se a política do navegador bloquear, a
    // primeira interação do visitante libera a reprodução automaticamente.
    void audio.play().catch(() => {
      document.addEventListener("pointerdown", startOnInteraction, { once: true });
    });
    return () => {
      audio.pause();
      if (!startedAfterInteraction) document.removeEventListener("pointerdown", startOnInteraction);
      audio.removeEventListener("play", sync);
      audio.removeEventListener("pause", sync);
    };
  }, []);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      try {
        await audio.play();
      } catch {
        setPlaying(false);
      }
    } else {
      audio.pause();
    }
  };

  return (
    <div className="music-player" aria-label="Música católica">
      <audio ref={audioRef} src="/pater-noster.ogg" loop preload="auto" autoPlay />
      <div className="flex min-w-0 items-center gap-3">
        <span className="music-player-icon" aria-hidden="true"><Music2 size={16} /></span>
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-foreground">Canto gregoriano</p>
          <p className="truncate text-[10px] text-muted-foreground">Pater Noster · Schola Gregoriana</p>
        </div>
      </div>
      <button type="button" onClick={toggle} className="music-player-button" aria-label={playing ? "Pausar música" : "Ouvir música católica"}>
        {playing ? <Pause size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
      </button>
    </div>
  );
}
