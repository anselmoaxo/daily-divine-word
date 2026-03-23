import { Cross } from "lucide-react";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8">
      <Cross className="text-accent animate-pulse" size={40} strokeWidth={1.5} />
      <div className="text-center">
        <p className="font-display text-2xl text-foreground mb-2">Carregando a liturgia...</p>
        <p className="font-body text-muted-foreground text-sm">Buscando as leituras do dia</p>
      </div>
      <div className="w-full max-w-2xl space-y-4 mt-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="liturgy-section animate-pulse">
            <div className="h-4 bg-muted rounded w-1/4 mb-4" />
            <div className="h-3 bg-muted rounded w-3/4 mb-2" />
            <div className="h-3 bg-muted rounded w-full mb-2" />
            <div className="h-3 bg-muted rounded w-5/6" />
          </div>
        ))}
      </div>
    </div>
  );
}
