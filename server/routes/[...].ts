import { defineHandler } from 'nitro';
import { readValidatedBody } from 'nitro/h3';
import { fetchLiturgia } from '@/lib/liturgy-api';
import { getLiturgicalColorClass, formatPortugueseDate } from '@/lib/liturgy-api';

// Helper to escape HTML
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Helper to format date for URL
function formatDateForUrl(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}/${m}/${d}`;
}

// Helper to get previous/next/today dates
function getNavDates(current: Date) {
  const yesterday = new Date(current);
  yesterday.setDate(yesterday.getDate() - 1);
  const tomorrow = new Date(current);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return { yesterday, tomorrow, today };
}

// Main handler
export default defineHandler(async (event) => {
  const path = event.path;

  // Defer to API routes
  if (path.startsWith('/api/')) {
    // Since we have separate API route files, we should let Nitro handle them.
    // To do that, we call next() to skip this handler.
    // However, in Nitro catch-all, we need to check if the path matches API.
    // We'll just return a 404 for API paths here and let the specific API routes catch them.
    // But we placed this catch-all after API routes? Nitro processes routes in order.
    // Since we have specific API route files, they will be matched first.
    // So we can safely process non-API paths here.
    // If somehow an API path reaches here, we pass.
    // We'll just return a 404 to avoid interference.
    return { status: 404, body: 'Not found' };
  }

  // Determine if request is for a specific date liturgy path: /liturgia/YYYY/MM/DD or /YYYY/MM/DD
  // We'll support both /liturgia/YYYY/MM/DD and /YYYY/MM/DD for simplicity.
  // Also support root '/' which redirects to today.
  let date: Date | null = null;
  let isLiturgyPath = false;

  if (path === '/') {
    // Redirect to today's liturgy URL
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const url = `/liturgia/${formatDateForUrl(today)}`;
    return {
      status: 302,
      headers: {
        Location: url,
      },
      body: `Redirecting to ${url}`,
    };
  }

  // Match /liturgia/YYYY/MM/DD or /YYYY/MM/DD
  const match = path.match(/^\/liturgia\/(\d{4})\/(\d{1,2})\/(\d{1,2})$/) || path.match(/^\/(\d{4})\/(\d{1,2})\/(\d{1,2})$/);
  if (match) {
    const [, yStr, mStr, dStr] = match;
    const year = parseInt(yStr, 10);
    const month = parseInt(mStr, 10) - 1; // months are 0-index
    const day = parseInt(dStr, 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      date = new Date(year, month, day);
      // Validate date (e.g., not invalid like 2026-02-30)
      if (
        date.getFullYear() === year &&
        date.getMonth() === month &&
        date.getDate() === day
      ) {
        isLiturgyPath = true;
      } else {
        date = null;
      }
    }
  }

  if (isLiturgyPath && date) {
    try {
      const liturgiaData = await fetchLiturgia(date);
      const colorTheme = getLiturgicalColorClass(liturgiaData.cor);
      const formattedDate = formatPortugueseDate(liturgiaData.data);
      const { yesterday, tomorrow, today } = getNavDates(date);

      // Build HTML
      const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Liturgia Diária de ${formattedDate} — Leituras e Evangelho</title>
  <meta name="description" content="Confira a Liturgia Diária de ${formattedDate}: leituras da missa, salmo responsorial, Evangelho, orações e reflexão do dia.">
  <link rel="canonical" href="https://liturgia.anselmotech.online/liturgia/${formatDateForUrl(date)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://liturgia.anselmotech.online/liturgia/${formatDateForUrl(date)}">
  <meta property="og:title" content="Liturgia Diária de ${formattedDate}">
  <meta property="og:description" content="Confira a Liturgia Diária de ${formattedDate}: leituras da missa, salmo responsorial, Evangelho, orações e reflexão do dia.">
  <meta property="og:image" content="https://liturgia.anselmotech.online/og-image.png">
  <meta property="og:site_name" content="Anselmo Tech">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="https://liturgia.anselmotech.online/liturgia/${formatDateForUrl(date)}">
  <meta name="twitter:title" content="Liturgia Diária de ${formattedDate}">
  <meta name="twitter:description" content="Confira a Liturgia Diária de ${formattedDate}: leituras da missa, salmo responsorial, Evangelho, orações e reflexão do dia.">
  <meta name="twitter:image" content="https://liturgia.anselmotech.online/og-image.png">
  <meta name="robots" content="index, follow">
  <style>
    body { font-family: 'Lora', serif; background: #f8f6f0; color: #222; margin: 0; padding: 20px; }
    .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    h1, h2 { color: #8b0000; }
    .date { text-align: center; font-size: 1.5em; margin-bottom: 20px; color: #555; }
    .liturgia { font-style: italic; text-align: center; margin-bottom: 30px; color: #8b0000; }
    .reading { margin-bottom: 30px; }
    .reading h3 { margin-top: 0; color: #8b0000; }
    .refrao { font-weight: bold; text-align: center; margin: 10px 0; }
    .verse { margin: 10px 0; line-height: 1.6; }
    .nav { text-align: center; margin-top: 40px; font-size: 0.9em; color: #666; }
    .nav a { color: #8b0000; text-decoration: none; margin: 0 10px; }
    .nav a:hover { text-decoration: underline; }
    .footer { text-align: center; margin-top: 40px; font-size: 0.8em; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="date">${formattedDate}</div>
    <div class="liturgia">${escapeHtml(liturgiaData.liturgia)}</div>

    ${liturgiaData.santo ? `<div class="reading"><h3>Santo do Dia</h3><p class="verse">${escapeHtml(liturgiaData.santo)}</p></div>` : ''}
    ${liturgiaData.reflexao ? `<div class="reading"><h3>Reflexão</h3><p class="verse">${escapeHtml(liturgiaData.reflexao)}</p></div>` : ''}

    <div class="reading">
      <h3>Primeira Leitura</h3>
      ${liturgiaData.leituras.primeiraLeitura.map((r: any) => `
        <div class="verse"><strong>${escapeHtml(r.referencia)}</strong> ${escapeHtml(r.texto)}</div>
      `).join('')}
    </div>

    <div class="reading">
      <h3>Salmo Responsorial</h3>
      ${liturgiaData.leituras.salmo.map((r: any) => {
        const refrao = r.refrao ? `<div class="refrao">R. ${escapeHtml(r.refrao)}</div>` : '';
        const verses = r.texto.split('\n').map(v => `<p class="verse">${escapeHtml(v)}</p>`).join('');
        return `<div>${refrao}${verses}</div>`;
      }).join('')}
    </div>

    ${liturgiaData.leituras.segundaLeitura && liturgiaData.leituras.segundaLeitura.length > 0 ? `
    <div class="reading">
      <h3>Segunda Leitura</h3>
      ${liturgiaData.leituras.segundaLeitura.map((r: any) => `
        <div class="verse"><strong>${escapeHtml(r.referencia)}</strong> ${escapeHtml(r.texto)}</div>
      `).join('')}
    </div>
    ` : ''}

    <div class="reading">
      <h3>Evangelho</h3>
      ${liturgiaData.leituras.evangelho.map((r: any) => `
        <div class="verse"><strong>${escapeHtml(r.referencia)}</strong> ${escapeHtml(r.texto)}</div>
      `).join('')}
    </div>

    <div class="reading">
      <h3>Orações</h3>
      <p><strong>Coleta:</strong> ${escapeHtml(liturgiaData.oracoes.coleta)}</p>
      <p><strong>Oferendas:</strong> ${escapeHtml(liturgiaData.oracoes.oferendas)}</p>
      <p><strong>Comunhão:</strong> ${escapeHtml(liturgiaData.oracoes.comunhao)}</p>
      ${liturgiaData.oracoes.extras && liturgiaData.oracoes.extras.length > 0 ? `
      <h4>Oração Extra</h4>
      ${liturgiaData.oracoes.extras.map((e: any) => `
        <p><strong>${escapeHtml(e.titulo)}:</strong> ${escapeHtml(e.texto)}</p>
      `).join('')}
      ` : ''}
    </div>

    ${liturgiaData.antifonas ? `
    <div class="reading">
      <h3>Antífonas</h3>
      ${liturgiaData.antifonas.entrada ? `<p><strong>Entrada:</strong> ${escapeHtml(liturgiaData.antifonas.entrada)}</p>` : ''}
      ${liturgiaData.antifonas.comunhao ? `<p><strong>Comunhão:</strong> ${escapeHtml(liturgiaData.antifonas.comunhao)}</p>` : ''}
    </div>
    ` : ''}

    <div class="nav">
      <a href="/liturgia/${formatDateForUrl(yesterday)}">← Dia anterior</a> |
      <a href="/liturgia/${formatDateForUrl(today)}">Hoje</a> |
      <a href="/liturgia/${formatDateForUrl(tomorrow)}">Próximo dia →</a>
    </div>

    <div class="footer">
      Dados fornecidos por <a href="https://liturgia.up.railway.app/" target="_blank" rel="noopener">Liturgia API</a><br>
      &copy; ${new Date().getFullYear()} Anselmo Tech
    </div>
  </div>

  <!-- Inject data for client-side hydration -->
  <script>
    window.__LITURGIA_DATA__ = ${JSON.stringify(liturgiaData)};
    window.__LITURGIA_DATE__ = ${date.getTime()};
  </script>
</body>
</html>
      `.trim();

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: html,
      };
    } catch (err: any) {
      // Error rendering liturgy page
      console.error('Error rendering liturgy page:', err);
      return {
        status: 503,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
        },
        body: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Liturgia Indisponível</title>
          <meta name="robots" content="noindex, follow">
          <style>
            body { font-family: 'Lora', serif; background: #f8f6f0; color: #222; margin: 0; padding: 20px; text-align: center; }
            .container { max-width: 600px; margin: 0 auto; padding: 40px; }
            h1 { color: #8b0000; }
            .btn { display: inline-block; margin-top: 20px; padding: 10px 20px; background: #8b0000; color: white; text-decoration: none; border-radius: 4px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Liturgia temporariamente indisponível</h1>
            <p>Não foi possível carregar a liturgia para a data solicitada. Por favor, tente novamente mais tarde.</p>
            <a href="/" class="btn">Volte para a página inicial</a>
          </div>
        </body>
        </html>
        `.trim(),
      };
    }
  }

  // For any other path (like /politica-de-privacidade), serve the SPA shell (index.html)
  // We'll read the index.html file from the public directory.
  // Since we are in a Nitro server, we can use `event.node.res` to sendfile, but simpler: return the HTML as string.
  // We'll read the file from disk using Node fs (available in Nitro).
  // However, to avoid complexity, we can redirect to root? But we want to keep client-side routes.
  // We'll return the index.html content.
  try {
    // In Nitro, we can use `await readFile` from 'node:fs/promises' but we need to import.
    // Instead, we can use `event.context.nuxt`? Not available.
    // We'll fallback to sending a simple shell that loads the SPA.
    // Since the SPA is built and served from /assets, we can just return the index.html from the public folder.
    // We'll assume the file is at `../../public/index.html` relative to this file.
    const fs = await import('node:fs');
    const path = await import('node:path');
    const filePath = path.resolve(process.cwd(), 'public', 'index.html');
    const html = await fs.promises.readFile(filePath, 'utf-8');
    return {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
      },
      body: html,
    };
  } catch (e) {
    return {
      status: 500,
      body: 'Internal server error',
    };
  }
});