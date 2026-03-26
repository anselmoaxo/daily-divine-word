import { useState } from "react";
import { MessageCircle, ShieldCheck, Loader2, XCircle, Quote, UserMinus } from "lucide-react";
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.success("Cadastro realizado com sucesso! ✨");
      setPhone("");
      setName("");
      setConsent(false);
    } catch (error) {
      toast.error("Erro ao realizar cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Sua solicitação de cancelamento foi enviada.");
      setShowUnsubscribe(false);
    } catch (error) {
      toast.error("Erro ao processar cancelamento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cnbb-section bg-gradient-to-b from-secondary/30 to-background rounded-[2rem] p-8 md:p-12 my-8 border border-gold/20 shadow-sm overflow-hidden relative">
      {/* Decorative element */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="max-w-lg mx-auto text-center relative z-10">
        <div className="inline-flex p-4 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 mb-6 shadow-inner">
          <MessageCircle size={28} />
        </div>
        
        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 leading-tight text-foreground">
          Receba a Liturgia Diária no seu WhatsApp 🙏
        </h2>
        
        <div className="space-y-3 mb-8">
          <p className="font-body text-foreground/80 text-base md:text-lg">
            Comece o dia inspirado pela Palavra de Deus.
          </p>
          <p className="font-body text-muted-foreground text-sm">
            Evangelho, Salmo e reflexões direto no seu celular. ✨
          </p>
        </div>

        {!showUnsubscribe ? (
          <div className="space-y-8">
            <form onSubmit={handleSubmit} className="space-y-5 text-left bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/40 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">Nome</Label>
                  <Input 
                    id="name"
                    placeholder="Seu nome" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">WhatsApp</Label>
                  <Input 
                    id="phone"
                    type="tel"
                    placeholder="(00) 00000-0000" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                    required
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-1">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                />
                <label htmlFor="consent" className="text-[10px] text-muted-foreground leading-relaxed cursor-pointer select-none">
                  Concordo em receber a liturgia diária. Seus dados estão protegidos pela LGPD.
                </label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-7 text-lg rounded-xl transition-all shadow-lg shadow-green-600/20 hover:scale-[1.01]"
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                Quero receber a liturgia!
              </Button>

              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <span className="text-gold">📌</span> Número seguro e sem spam.
                </p>
              </div>
            </form>

            <div className="pt-6 border-t border-gold/10">
              <div className="flex flex-col items-center gap-3 italic text-muted-foreground">
                <Quote size={16} className="text-gold/30" />
                <p className="text-sm max-w-xs">
                  “A Palavra do dia me ajuda a começar com fé e paz.”
                </p>
                <span className="text-[10px] font-bold uppercase tracking-widest not-italic text-foreground/40">
                  — Maria, SP
                </span>
              </div>
            </div>

            <button 
              type="button"
              onClick={() => setShowUnsubscribe(true)}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all uppercase tracking-[0.15em] font-medium"
            >
              <UserMinus size={12} className="opacity-50 group-hover:opacity-100" />
              Desejo cancelar minha inscrição
            </button>
          </div>
        ) : (
          <form onSubmit={handleUnsubscribe} className="space-y-5 text-left bg-card p-8 rounded-2xl border border-destructive/20 animate-fade-in shadow-2xl">
            <div className="space-y-2">
              <Label htmlFor="unsub-phone" className="text-[10px] font-bold uppercase tracking-wider opacity-60">Número para remover</Label>
              <Input 
                id="unsub-phone"
                type="tel"
                placeholder="(00) 00000-0000" 
                className="bg-background h-11"
                required
              />
            </div>
            <Button 
              type="submit" 
              variant="destructive"
              className="w-full py-6 font-bold rounded-xl"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin mr-2" /> : <XCircle className="mr-2" />}
              CONFIRMAR CANCELAMENTO
            </Button>
            <button 
              type="button"
              onClick={() => setShowUnsubscribe(false)}
              className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground mt-2 uppercase tracking-widest font-bold"
            >
              Voltar para o cadastro
            </button>
          </form>
        )}
      </div>
    </section>
  );
}