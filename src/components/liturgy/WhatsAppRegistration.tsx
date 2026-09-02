import React, { useState } from "react";
import { MessageCircle, ShieldCheck, Loader2, XCircle, Quote, UserMinus, Lock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { getLiturgicalColorClass } from "@/lib/liturgy-api";

const CONSENT_VERSION = "2026-09-01";

interface Props {
  liturgicalColor: string;
}

export default function WhatsAppRegistration({ liturgicalColor }: Props) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [consent, setConsent] = useState(false);
  const [showUnsubscribe, setShowUnsubscribe] = useState(false);
  
  // Campo Honeypot para proteção anti-bot (invisível para humanos)
  const [honeypot, setHoneypot] = useState("");

  const colorTheme = getLiturgicalColorClass(liturgicalColor);

  const formatPhone = (value: string) => {
    if (!value) return "";
    const digits = value.replace(/\D/g, "");
    const limited = digits.substring(0, 11);
    
    if (limited.length <= 2) {
      return limited.length > 0 ? `(${limited}` : "";
    }
    if (limited.length <= 6) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2)}`;
    }
    if (limited.length <= 10) {
      return `(${limited.substring(0, 2)}) ${limited.substring(2, 6)}-${limited.substring(6)}`;
    }
    return `(${limited.substring(0, 2)}) ${limited.substring(2, 7)}-${limited.substring(7)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  // Envio seguro para a API do próprio app; o n8n apenas lê os registros no Supabase.
  const sendToApi = async (phoneNumber: string) => {
    const response = await fetch("/api/cadastro", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: name.trim(),
        phone: phoneNumber,
        email: email.trim(),
        city: city.trim(),
        birthdate,
        consent,
        consentVersion: CONSENT_VERSION,
        honeypot,
      }),
    });

    if (!response.ok) {
      const result = await response.json().catch(() => null);
      throw new Error(result?.statusMessage || (response.status === 409 ? "Este telefone já está cadastrado para outro cliente." : `Erro ao salvar cadastro (Status: ${response.status})`));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    if (!consent) {
      toast.error("Você precisa aceitar os termos para continuar.");
      return;
    }
    
    const digitsOnly = phone.replace(/\D/g, "");
    if (digitsOnly.length < 10) {
      toast.error("Por favor, insira um número de telefone válido.");
      return;
    }

    // Proteção Honeypot simples no frontend
    if (honeypot) {
      const message = "Seja bem-vindo(a)! Sua inscrição foi realizada com sucesso. Você receberá a Liturgia Diária todos os dias, às 8h.";
      setFeedback({ type: "success", message });
      toast.success(message);
      setPhone("");
      setName("");
      return;
    }

    setLoading(true);
    try {
      await sendToApi(digitsOnly);
      const message = "Seja bem-vindo(a)! Sua inscrição foi realizada com sucesso. Você receberá a Liturgia Diária todos os dias, às 8h.";
      setFeedback({ type: "success", message });
      toast.success(message);
      setPhone("");
      setName("");
      setEmail("");
      setCity("");
      setBirthdate("");
      setConsent(false);
    } catch (error: unknown) {
      console.error("Erro ao enviar cadastro:", error);
      const message = error instanceof Error && error.message === "Este telefone já está cadastrado para outro cliente."
        ? error.message
        : "Não foi possível concluir a solicitação. Tente novamente.";
      setFeedback({ type: "error", message });
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="cnbb-section bg-gradient-to-b from-secondary/30 to-background rounded-[2rem] p-8 md:p-12 my-8 border border-gold/20 shadow-sm overflow-hidden relative">
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-gold/5 rounded-full blur-3xl" />
      
      <div className="max-w-lg mx-auto text-center relative z-10">
        <div role="status" aria-live="polite" aria-atomic="true" className={`mb-5 min-h-0 rounded-xl px-4 py-3 text-sm font-medium ${feedback ? (feedback.type === "success" ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200" : "bg-red-50 text-red-800 dark:bg-red-950/40 dark:text-red-200") : ""}`}>
          {feedback?.message}
        </div>
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
              
              {/* Campo Honeypot Invisível para Proteção Anti-Bot */}
              <div className="hidden" aria-hidden="true">
                <input
                  type="text"
                  name="website_honeypot"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                  tabIndex={-1}
                  autoComplete="off"
                />
              </div>

              <div className="space-y-4">
                {/* Nome e WhatsApp */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">Nome (obrigatório)</Label>
                    <Input 
                      id="name"
                      placeholder="Seu nome" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">WhatsApp (obrigatório)</Label>
                    <Input 
                      id="phone"
                      type="tel"
                      placeholder="(00) 00000-0000" 
                      value={phone}
                      onChange={handlePhoneChange}
                      className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                      required
                    />
                  </div>
                </div>

                {/* E-mail e Cidade */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">E-mail (opcional)</Label>
                    <Input 
                      id="email"
                      type="email"
                      placeholder="seu@email.com" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">Cidade (opcional)</Label>
                    <Input 
                      id="city"
                      placeholder="Sua cidade" 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                    />
                  </div>
                </div>

                {/* Data de Nascimento */}
                <div className="space-y-2">
                  <Label htmlFor="birthdate" className="text-[10px] font-bold uppercase tracking-[0.1em] opacity-60">Data de nascimento (opcional)</Label>
                  <Input 
                    id="birthdate"
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="bg-background/50 border-border/40 focus:ring-green-500 h-11"
                  />
                </div>
              </div>

              <div className="flex items-start space-x-3 pt-1">
                <Checkbox 
                  id="consent" 
                  checked={consent}
                  onCheckedChange={(checked) => setConsent(checked as boolean)}
                  className="mt-1 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                  required
                />
                <label htmlFor="consent" className="text-[10px] text-muted-foreground leading-relaxed cursor-pointer select-none">
                  Autorizo o uso dos meus dados para receber a liturgia diária pelo WhatsApp, conforme nossa{" "}
                  <Link to="/politica-de-privacidade" className="underline text-gold hover:text-gold/80 font-semibold">
                    Política de Privacidade
                  </Link>.
                </label>
              </div>

              <Button 
                type="submit" 
                className={`w-full font-bold py-7 text-lg rounded-xl transition-all shadow-lg hover:scale-[1.01] ${colorTheme.buttonBg}`}
                disabled={loading}
              >
                {loading ? <Loader2 className="animate-spin mr-2" /> : <ShieldCheck className="mr-2" />}
                {loading ? "Aguarde…" : "Quero receber a liturgia!"}
              </Button>

              <div className="space-y-1.5 pt-2">
                <p className="text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1.5">
                  <Lock size={10} className="text-gold" /> Seus dados são enviados com conexão segura e usados para este serviço.
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
              onClick={() => {
                setPhone("");
                setShowUnsubscribe(true);
              }}
              className="group inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all uppercase tracking-[0.15em] font-medium"
            >
              <UserMinus size={12} className="opacity-50 group-hover:opacity-100" />
              Desejo cancelar minha inscrição
            </button>
          </div>
        ) : (
          <div className="space-y-5 text-left bg-card p-8 rounded-2xl border border-destructive/20 animate-fade-in shadow-2xl">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 shrink-0 text-destructive" aria-hidden="true" />
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Cancelar com segurança</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Responda <strong>CANCELAR</strong> pelo mesmo WhatsApp em que você recebe a Liturgia Diária. Assim, confirmamos que o pedido partiu do titular do número sem expor seus dados neste site.
                </p>
              </div>
            </div>
            <button 
              type="button"
              onClick={() => {
                setPhone("");
                setShowUnsubscribe(false);
              }}
              className="w-full text-center text-[10px] text-muted-foreground hover:text-foreground mt-2 uppercase tracking-widest font-bold"
            >
              Voltar para o cadastro
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
