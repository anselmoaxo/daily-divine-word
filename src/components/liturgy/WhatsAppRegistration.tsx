import { useState } from "react";
import { MessageCircle, ShieldCheck, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function WhatsAppRegistration() {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [consent, setConsent] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);

  // Substitua pela URL do seu Webhook do n8n
  const N8N_WEBHOOK_URL = "SUA_URL_DO_N8N_AQUI";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!consent) {
      toast.error("Você precisa aceitar os termos para continuar.");
      return;
    }

    if (phone.length < 10) {
      toast.error("Por favor, insira um número de telefone válido.");
      return;
    }

    setLoading(true);
    try {
      // Simulação de envio para o n8n
      // No seu caso real, descomente o código abaixo:
      /*
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, action: 'subscribe', date: new Date().toISOString() })
      });
      if (!response.ok) throw new Error();
      */
      
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulação
      toast.success("Cadastro realizado com sucesso! Você receberá a liturgia em breve.");
      setPhone("");
      setName("");
      setConsent(false);
    } catch (error) {
      toast.error("Erro ao realizar cadastro. Tente novamente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Envio de cancelamento para o n8n
      toast.success("Sua solicitação de cancelamento foi enviada.");
      setShowUnsubscribe(false);
    } catch (error) {
      toast.error("Erro ao processar cancelamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cnbb-section bg-secondary/30 rounded-2xl p-8 mt-12 border border-border/50">
      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex p-3 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-4">
          <MessageCircle size={24} />
        </div>
        
        <h2 className="font-display text-2xl font-bold mb-2">Liturgia no seu WhatsApp</h2>
        <p className="font-body text-muted-foreground text-sm mb-8">
          Receba diariamente as leituras e reflexões diretamente no seu celular.
        </p>

        {!showUnsubscribe ? (
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="space-y-2">
              <Label htmlFor="name">Nome (opcional)</Label>
              <Input 
                id="name"
                placeholder="Seu nome" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-background"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">WhatsApp (com DDD)</Label>
              <Input 
                id="phone"
                type="tel"
                placeholder="(00) 00000-0000" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="bg-background"
                required
              />
            </div>

            <div className="flex items-start space-x-3 pt-2">
              <Checkbox 
                id="consent" 
                checked={consent}
                onCheckedChange={(checked) => setConsent(checked as boolean)}
                className="mt-1"
              />
              <div className="grid gap-1.5 leading-none">
                <label
                  htmlFor="consent"
                  className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer"
                >
                  Ao me cadastrar, concordo em receber mensagens automáticas com a liturgia diária. 
                  Seus dados serão usados exclusivamente para este fim, em conformidade com a LGPD.
                </label>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
              QUERO RECEBER A LITURGIA
            </Button>

            <button 
              type="button"
              onClick={() => setShowUnsubscribe(true)}
              className="w-full text-center text-[10px] text-muted-foreground hover:text-primary underline mt-4 uppercase tracking-widest"
            >
              Desejo cancelar minha inscrição
            </button>
          </form>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-4 text-left animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="unsub-phone">Informe o número para remover</Label>
              <Input 
                id="unsub-phone"
                type="tel"
                placeholder="(00) 00000-0000" 
                className="bg-background"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="destructive"
              className="w-full py-6"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2" />}
              CONFIRMAR CANCELAMENTO
            </Button>
            <button 
              type="button"
              onClick={() => setShowUnsubscribe(false)}
              className="w-full text-center text-[10px] text-muted-foreground hover:text-primary mt-2 uppercase tracking-widest"
            >
              Voltar para o cadastro
            </button>
          </form>
        )}
      </div>
    </section>
  );
}