# Tab Zero — an ADHD-friendly focus dashboard

Dump everything on your mind. AI turns the chaos into one clear task at a time.

## How it works

1. **Sign in** (`/sign-in`) — email magic link via Supabase Auth, no password to manage.
2. **Dump** (`/dump`) — type (or speak) a messy, unstructured brain dump. No formatting needed.
3. Gemini extracts discrete, actionable tasks (title, category, priority, estimated time, energy level) and saves them.
4. **Focus** (`/focus`) — shows exactly **one** task, optionally filtered by how much energy you have right now. Everything else stays out of sight.
5. Mark it done, skip it (goes to the back of the queue), or snooze it an hour. The next one appears.
6. **History** (`/history`) — a log of everything you've finished.

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind
- Prisma + PostgreSQL
- Supabase Auth (magic link / passwordless)
- Gemini API (`gemini-2.5-flash`) for task extraction, using `responseSchema` to force strict JSON output, wrapped in retry/backoff for transient failures
- Web Speech API for voice-to-text dumping (Chrome/Edge; not supported in Firefox, partial in Safari)
- Zustand for focus-view UI state
- Framer Motion for the task-reveal/completion transitions

## Setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:
- `DATABASE_URL` — your Supabase project's Postgres connection string (Project Settings → Database).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — same project, from Project Settings → API.
- `GEMINI_API_KEY` — free, no card required, from https://aistudio.google.com/apikey

In your Supabase project dashboard, also enable **Email OTP / magic link** under Authentication → Providers (it's on by default for new projects) and add `http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs.

Then:

```bash
npx prisma generate
npx prisma db push     # creates the tables in your database
npm run dev
```

Open http://localhost:3000 — you'll be redirected to `/sign-in` first, then to `/dump` once you're logged in.

## Design

The app now has a real visual identity instead of default shadcn styling, built around the product's actual mechanic: chaos in, one clear thing out.

- **Landing page** (`/`) — dark hero with scattered handwritten thought-fragments (Caveat font) drifting slowly, converging visually on one calm, glowing task card. That convergence *is* the pitch — no stock illustration needed. Signs-out users land here; signed-in users skip straight to `/dump`.
- **The working app** (`/dump`, `/focus`, `/history`) — flips to a light, quiet "paper" surface. Motion mostly stops here on purpose: once someone's actually doing the work, ambient animation should never compete with the one task on screen. There's just a barely-visible slow-drifting glow (`AmbientBackground.tsx`) so it doesn't feel like a flat gray box.
- **Type**: Lexend for all real UI (it's an actual font engineered to reduce reading friction — a genuinely on-brief choice, not just a nice-looking sans), Caveat only for the landing hero's scattered fragments, JetBrains Mono for timer digits and badge labels.
- **Color tokens** live in `src/app/globals.css` under `@theme inline` (Tailwind v4's CSS-first config) — `ink`/`paper` for the two surfaces, `clarity` (warm gold) for the "one task" accent, `scatter` (periwinkle) for chaos/energy states, `calm` (sage) for completion, `alert` (coral) for high priority/errors.
- All animation respects `prefers-reduced-motion` globally (see the media query at the bottom of `globals.css`).

Fonts are self-hosted via Fontsource npm packages rather than `next/font/google` — no external network fetch at build or runtime, which also means one less third-party dependency in production.

## Important notes / known gaps (read before you build on this)



- **Gemini free tier notes:** Flash's free tier is generous (~1,500 requests/day at last check) but rate-limited per minute — `lib/ai/retry.ts` retries 429s/5xx/network errors with exponential backoff, but a sustained outage will still surface an error to the user. Also, free-tier traffic may be used by Google to improve their models — worth a mention in your own privacy notice since users are dumping personal/messy thoughts in.
- **Energy matching is a soft budget, not a hard filter:** picking "Low energy" shows only LOW-energy tasks, but if none exist it falls back to the easiest available task rather than showing an empty queue — the UI flags this with a small note so it's honest about the mismatch.
- **No recurring tasks or streaks/gamification yet** — still v2 ideas, not built here.
- **Voice input has no server-side fallback.** It's 100% client-side Web Speech API — nothing is sent to a server for transcription, but that also means it simply won't work in browsers that don't support it (the mic button just doesn't render in that case).
- This was scaffolded/edited in a sandboxed build environment without full internet access, so `npx prisma generate` was never actually run end-to-end here (its engine binary download was blocked) — `npm run build` and ESLint were verified clean on everything else. Expected to just work once you run `npx prisma generate` with normal internet access.

## Folder structure

```
src/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── dump/page.tsx
│   │   ├── focus/page.tsx
│   │   ├── history/page.tsx
│   │   └── layout.tsx
│   ├── api/
│   │   ├── ai/parse-dump/route.ts
│   │   ├── tasks/next/route.ts          → energy-aware "next task" logic
│   │   ├── tasks/[id]/route.ts
│   │   └── dumps/history/route.ts
│   ├── auth/callback/route.ts            → exchanges magic-link code for a session
│   ├── layout.tsx
│   └── page.tsx          → the landing/intro page (redirects to /dump if already signed in)
├── components/
│   ├── ui/                → button, card, badge, textarea
│   ├── shared/
│   │   ├── SignOutButton.tsx
│   │   └── AmbientBackground.tsx
│   ├── landing/ChaosHero.tsx    → the hero's signature scatter-to-clarity animation
│   ├── dump/
│   │   ├── DumpInput.tsx
│   │   └── VoiceDumpButton.tsx
│   └── focus/
│       ├── FocusCard.tsx
│       ├── EnergyPicker.tsx
│       ├── TaskTimer.tsx
│       └── CompletionCelebration.tsx
├── lib/
│   ├── ai/
│   │   ├── client.ts        → Gemini SDK setup + JSON schema
│   │   ├── prompts.ts        → the extraction prompt (iterate on this a lot)
│   │   └── retry.ts          → retry/backoff wrapper
│   ├── supabase/
│   │   ├── client.ts         → browser Supabase client
│   │   └── server.ts         → server Supabase client
│   ├── hooks/useSpeechRecognition.ts
│   ├── db/prisma.ts          → getCurrentUserId() now backed by real auth
│   └── utils.ts
├── stores/focusStore.ts       → includes energyFilter/matchedEnergy now
├── types/
│   ├── task.ts
│   └── speech-recognition.d.ts
└── proxy.ts                   → session refresh + route protection (was middleware.ts)
prisma/schema.prisma
```

## Suggested next steps

1. Run it locally, do a few real brain dumps, and tune the prompt in `lib/ai/prompts.ts` against what actually comes out — this is the piece most worth iterating on.
2. Add OAuth providers (Google, GitHub) in Supabase alongside magic link, if you want fewer clicks for return users.
3. Recurring tasks / calendar sync.
4. Streaks or other gentle gamification for the completion moment.

