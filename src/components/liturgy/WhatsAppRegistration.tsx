import { useState } from "react";
import { MessageCircle, ShieldCheck, Loader2, XCircle, Quote } from "lucide-react";
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
      /*
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, action: 'subscribe', date: new Date().toISOString() })
      });
      if (!response.ok) throw new Error();
      */
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Cadastro realizado com sucesso! ✨");
      setPhone("");
      setName("");
      setConsent(false);
    } catch (error) {
      toast.error("Erro ao realizar cadastro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      toast.success("Sua solicitação de cancelamento foi enviada.");
      setShowUnsubscribe(false);
    } catch (error) {
      toast.error("Erro ao processar cancelamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cnbb-section bg-secondary/20 rounded-3xl p-8 md:p-12 mt-16 border border-border/40 shadow-sm">
      <div className="max-w-lg mx-auto text-center">
        <div className="inline-flex p-4 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 mb-6">
          <MessageCircle size={28} />
        </div>
        
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 leading-tight">
          Receba a Liturgia Diária no seu WhatsApp 🙏
        </h2>
        
        <div className="space-y-4 mb-10">
          <p className="font-body text-foreground/80 text-base md:text-lg leading-relaxed">
            Comece o dia inspirado pela Palavra de Deus.
          </p>
          <p className="font-body text-muted-foreground text-sm md:text-base">
            Cadastre seu número e receba todos os dias o Evangelho, Salmo e reflexões direto no seu WhatsApp. ✨
          </p>
        </div>

        {!showUnsubscribe ? (
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-5 text-left bg-card p-6 rounded-2xl border border-border/50 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider opacity-70">Nome</Label>
                  <Input 
                    id="name"
                    placeholder="Seu nome" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background border-border/60 focus:ring-green-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-xs font-bold uppercase tracking-wider opacity-70">WhatsApp</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-background border-border/60 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-2">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label
                  htmlFor="consent"
                  className="text-[11px] text-muted-foreground leading-relaxed cursor-pointer select-none"
                >
                  Ao me cadastrar, concordo em receber mensagens automáticas com a liturgia diária. 
                  Seus dados serão usados exclusivamente para este fim, em conformidade com a LGPD.
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-7 text-lg rounded-xl transition-all hover:scale-[1.02] active:scale-95"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                Quero receber a liturgia!
              </Button>

              <div className="space-y-2 pt-2">
                <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <span>📌</span> Seu número ficará seguro conosco e você pode cancelar a qualquer momento.
                </p>
                <p className="text-[11px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <span>📌</span> Sem spam, só a Liturgia diária.
                </p>
              </div>
            </form>

            {/* Testimonial */}
            <div className="pt-4 border-t border-border/30">
              <div className="flex flex-col items-center gap-3 italic text-muted-foreground">
                <Quote size={20} className="text-gold/40" />
                <p className="text-sm md:text-base max-w-xs">
                  “A Palavra do dia me ajuda a começar com fé e paz.”
                </p>
                <span className="text-xs font-bold uppercase tracking-widest not-italic text-foreground/60">
                  — Maria, SP
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowUnsubscribe(true)}
              className="text-[10px] text-muted-foreground hover:text-primary underline uppercase tracking-widest transition-colors"
            >
              Desejo cancelar minha inscrição
            </button>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-5 text-left bg-card p-8 rounded-2xl border border-border/50 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="unsub-phone" className="text-xs font-bold uppercase tracking-wider opacity-70">Número para remover</Label>
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
              className="w-full py-6 font-bold"
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