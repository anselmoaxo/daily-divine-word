"use client";

import React from "react";
import { ChevronLeft, ShieldCheck, Lock, Eye, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/20 py-12 px-6">
      <div className="max-w-2xl mx-auto">
        <Button
          onClick={() => navigate("/")}
          variant="ghost"
          className="mb-8 gap-2 hover:bg-secondary/50 text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft size={16} /> Voltar para a Liturgia
        </Button>

        <header className="mb-12 text-center">
          <div className="inline-flex p-3 rounded-full bg-gold/10 text-gold mb-4">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-display font-bold tracking-tight">
            Política de Privacidade
          </h1>
          <p className="text-xs font-ui tracking-widest uppercase opacity-60 mt-2">
            Liturgia Diária & LGPD
          </p>
        </header>

        <div className="prose prose-stone dark:prose-invert font-body space-y-6 text-foreground/90 leading-relaxed">
          <p className="text-sm text-muted-foreground italic">
            Última atualização: Março de 2026
          </p>

          <p>
            A sua privacidade é de extrema importância para nós. Esta Política de Privacidade explica como coletamos, usamos, processamos e protegemos os seus dados pessoais ao se cadastrar para receber a Liturgia Diária via WhatsApp.
          </p>

          <section className="space-y-3 pt-4">
            <h2 className="font-display text-xl font-bold text-gold flex items-center gap-2">
              <Eye size={18} /> 1. Quais dados coletamos?
            </h2>
            <p>
              Coletamos apenas as informações estritamente necessárias para o envio das mensagens e personalização da sua experiência:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Nome:</strong> Para nos referirmos a você de forma personalizada.</li>
              <li><strong>Número de WhatsApp:</strong> O canal de envio diário da liturgia.</li>
              <li><strong>E-mail, Cidade e Data de Nascimento (opcionais):</strong> Para comunicações eventuais e felicitações.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="font-display text-xl font-bold text-gold flex items-center gap-2">
              <Lock size={18} /> 2. Como usamos os seus dados?
            </h2>
            <p>
              Seus dados são utilizados exclusivamente para:
            </p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Enviar a Liturgia Diária, salmos e reflexões todas as manhãs.</li>
              <li>Processar solicitações de cancelamento de inscrição (opt-out).</li>
              <li>Garantir a segurança da plataforma contra acessos abusivos ou automatizados.</li>
            </ul>
            <p className="font-semibold text-gold">
              Nós nunca venderemos, alugaremos ou compartilharemos seus dados com terceiros para fins publicitários.
            </p>
          </section>

          <section className="space-y-3 pt-4">
            <h2 className="font-display text-xl font-bold text-gold flex items-center gap-2">
              <RefreshCw size={18} /> 3. Seus Direitos e Cancelamento (Opt-out)
            </h2>
            <p>
              Em conformidade com a Lei Geral de Proteção de Dados (LGPD), você tem o direito de acessar, retificar ou excluir seus dados a qualquer momento.
            </p>
            <p>
              Para cancelar o recebimento das mensagens e remover seus dados de nossa base de envios, basta utilizar o botão <strong>"Desejo cancelar minha inscrição"</strong> na página inicial ou responder "SAIR" diretamente no WhatsApp.
            </p>
          </section>

          <section className="space-y-3 pt-4 border-t border-border/40">
            <p className="text-sm text-muted-foreground">
              Ao utilizar nosso serviço, você concorda com os termos desta política. Se tiver dúvidas sobre como tratamos seus dados, entre em contato conosco.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}