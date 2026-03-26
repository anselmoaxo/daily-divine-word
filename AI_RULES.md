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