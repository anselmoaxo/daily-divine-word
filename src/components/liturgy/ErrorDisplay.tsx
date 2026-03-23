import { AlertCircle, RefreshCw } from "lucide-react";

interface Props {
  message: string;
  onRetry: () => void;
}

export default function ErrorDisplay({ message, onRetry }: Props) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <AlertCircle className="mx-auto mb-4 text-destructive" size={48} />
        <h2 className="font-display text-2xl text-foreground mb-2">Não foi possível carregar</h2>
        <p className="font-body text-muted-foreground mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition-opacity font-ui text-sm"
        >
          <RefreshCw size={16} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
