# AI Development Rules - Liturgia Diária

## Tech Stack
- **Framework**: React 18 with Vite and TypeScript for a fast, type-safe development experience.
- **Styling**: Tailwind CSS for utility-first styling, following a "CNBB-inspired" clean liturgical aesthetic.
- **UI Components**: shadcn/ui (built on Radix UI primitives) located in `src/components/ui/`.
- **Icons**: Lucide React for consistent, accessible iconography.
- **Data Fetching**: TanStack Query (React Query) for caching and server state management.
- **Backend**: Supabase for database (PostgreSQL) and Edge Functions.
- **Routing**: React Router DOM (v6) for client-side navigation.
- **Animations**: Framer Motion for smooth transitions and liturgical solemnity.
- **Forms**: React Hook Form combined with Zod for schema-based validation.

## Library Usage Rules
- **UI Components**: Always check `src/components/ui/` before creating new low-level components. Use shadcn/ui patterns.
- **Styling**: Use Tailwind classes exclusively. Avoid custom CSS unless absolutely necessary (defined in `src/index.css`).
- **Icons**: Use `lucide-react`. Do not install other icon libraries.
- **State Management**: Use `useQuery` and `useMutation` from TanStack Query for all API interactions. Use React `useState`/`useContext` only for local UI state.
- **Database**: Use the generated Supabase client in `src/integrations/supabase/client.ts`. Follow the types in `types.ts`.
- **Utilities**: Use the `cn()` utility from `src/lib/utils.ts` for conditional Tailwind classes.
- **Animations**: Use `framer-motion` for any entry/exit animations or layout transitions.
- **Toasts**: Use `sonner` (via the `Sonner` component in `App.tsx`) for non-intrusive notifications.

<!-- nitro:start -->

## Nitro Server Layer

This project has a Nitro server layer for backend API routes. A `nitro.config.ts` at the app root sets `serverDir: "./server"` — do not move or remove it.

### vite.config.ts

`vite.config.ts` already imports `nitro` from `"nitro/vite"` and registers `nitro()` as the LAST entry in the `plugins` array. Do not move it earlier — it must run after Vite's module-transform middleware, otherwise Nitro's SPA fallback intercepts Vite internal URLs (`/src/*.tsx`, `/@vite/client`, `/@react-refresh`, `/@fs/*`) and returns `index.html`, breaking the preview.

### API Route Conventions

- Write routes in `server/routes/api/` (NEVER top-level `/api/`).
- Dynamic routes: `[param].ts`. Method-specific: `hello.get.ts`, `hello.post.ts`.
- Runtime config: `useRuntimeConfig()` (env vars prefixed with `NITRO_`).

### Imports — read carefully

Imports come from two different sources:

- `defineHandler` and `useRuntimeConfig` are imported from **`"nitro"`**.
- **Every request/response helper comes from `"nitro/h3"`** — Nitro v3 re-exports h3 utilities through that subpath. Common ones: `readBody`, `readValidatedBody`, `getQuery`, `getRouterParam`, `getRouterParams`, `createError`, `sendError`, `setResponseStatus`, `getRequestHeaders`, `getRequestURL`, `setCookie`, `getCookie`, `deleteCookie`.

Worked example — `server/routes/api/todos.post.ts`:

```ts
import { defineHandler } from "nitro";
import { readBody, createError } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody<{ title?: string }>(event);
  if (!body?.title) {
    throw createError({ statusCode: 400, statusMessage: "title is required" });
  }
  return { ok: true, title: body.title };
});
```

### Server-side packages

Any package used inside `server/` (database drivers like `@neondatabase/serverless`, auth SDKs, third-party API clients) must be in `package.json`. Add it before writing the first server file that imports it. NEVER import these from `src/` — code under `src/` ships to the browser, so importing server packages there leaks them and usually breaks the build.

### Common mistakes

- `import { readBody } from "nitro"` → wrong. h3 utilities are not exported from `"nitro"`. Use `"nitro/h3"`.
- `import { readBody } from "h3"` → wrong. Even though Nitro is built on h3, you import through `"nitro/h3"` (the version Nitro re-exports), not `"h3"` directly.
- `nitro()` placed before `react()` in `plugins` → wrong. Must be the LAST entry, otherwise the SPA fallback intercepts Vite internals.
- Omitting `nitro()` from `vite.config.ts` entirely → `/api/*` returns `index.html` instead of JSON.
- Importing server-only packages or referencing server-only env vars (`process.env.DATABASE_URL`, secrets) from `src/` → wrong. The Vite client bundle is public; this leaks them. Server code lives in `server/` only.

<!-- nitro:end -->
