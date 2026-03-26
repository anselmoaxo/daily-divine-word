import { Cross } from "lucide-react";

export default function LoadingSkeleton() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 p-8 bg-background">
      <div className="relative">
        <Cross className="text-gold animate-pulse" size={48} strokeWidth={1.5} />
        <div className="absolute inset-0 bg-gold/20 blur-xl rounded-full animate-pulse" />
      </div>
      <div className="text-center space-y-2">
        <p className="font-display text-2xl text-foreground font-medium">Preparando a Liturgia...</p>
        <p className="font-body text-muted-foreground text-sm animate-bounce">Buscando as leituras sagradas</p>
      </div>
      <div className="w-full max-w-2xl space-y-8 mt-8">
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-4 opacity-40">
            <div className="h-3 bg-muted rounded w-1/4 mx-auto" />
            <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
            <div className="space-y-2">
              <div className="h-3 bg-muted rounded w-full" />
              <div className="h-3 bg-muted rounded w-5/6" />
              <div className="h-3 bg-muted rounded w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}