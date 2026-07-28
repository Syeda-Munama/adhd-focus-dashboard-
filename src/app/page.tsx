// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { createClient } from "@/lib/supabase/server";
// import { ChaosHero } from "@/components/landing/ChaosHero";

// const STEPS = [
//   {
//     label: "Dump",
//     body: "Say everything that's stuck in your head, typed or spoken, in whatever order it comes out.",
//   },
//   {
//     label: "Sort",
//     body: "Gemini reads the mess and pulls out real tasks — title, category, how long, how much energy.",
//   },
//   {
//     label: "Focus",
//     body: "You see exactly one task at a time. Nothing else is on screen until you're ready for it.",
//   },
// ];

// export default async function LandingPage() {
//   const supabase = await createClient();
//   const {
//     data: { user },
//   } = await supabase.auth.getUser();

//   if (user) {
//     redirect("/dump");
//   }

//   return (
//     <div className="min-h-screen bg-ink text-white">
//       <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
//         <span className="font-mono text-sm tracking-[0.2em] text-white/60">
//           TAP ZERO
//         </span>
//         <div className="flex items-center gap-3 ">
//         <Link
//           href="/sign-in"
//           className="rounded-full bg-clarity px-5 py-2 text-sm font-medium text-clarity-ink transition-transform hover:scale-105"
//         >
//           Sign in
//         </Link>
//         <Link
//           href="/sign-up"
//           className="rounded-full bg-clarity px-5 py-2 text-sm font-medium text-clarity-ink transition-transform hover:scale-105"
//         >
//           Sign up
//         </Link>
//         </div>
//       </header>

//       <main>
//         {/* Hero */}
//         <section className="mx-auto max-w-5xl px-6 pb-4 pt-8 text-center sm:pt-12">
//           <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-scatter">
//             for brains that run twelve tabs at once
//           </p>
//           <h1 className="mx-auto max-w-3xl text-4xl font-medium leading-tight sm:text-6xl">
//             Your head is loud.
//             <br />
//             <span className="text-white/60">This is the one thing that matters right now.</span>
//           </h1>

//           <ChaosHero />

//           <div className="mx-auto -mt-6 flex max-w-md flex-col items-center gap-4 sm:-mt-10">
//             <p className="text-white/60">
//               Empty your head into one box. Get back exactly one task, in
//               plain language, whenever you&apos;re ready for it.
//             </p>
//             <Link
//               href="/sign-in"
//               className="rounded-full bg-clarity px-8 py-4 text-base font-medium text-clarity-ink shadow-[0_0_40px_-10px_rgba(242,180,65,0.6)] transition-transform hover:scale-105"
//             >
//               Start clearing your head
//             </Link>
//           </div>
//         </section>

//         {/* How it works -- a genuine 3-step sequence, so numbering earns its place */}
//         <section className="mx-auto mt-28 max-w-5xl px-6">
//           <div className="grid gap-8 sm:grid-cols-3">
//             {STEPS.map((step, i) => (
//               <div key={step.label} className="border-t border-ink-border pt-6">
//                 <p className="font-mono text-xs text-white/40">0{i + 1}</p>
//                 <h3 className="mt-2 text-xl font-medium">{step.label}</h3>
//                 <p className="mt-2 text-sm leading-relaxed text-white/60">
//                   {step.body}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </section>

//         {/* Supporting details, kept quiet and short */}
//         <section className="mx-auto mt-24 max-w-5xl px-6">
//           <div className="grid gap-6 rounded-[28px] border border-ink-border bg-ink-soft/60 p-8 sm:grid-cols-2">
//             <div>
//               <p className="font-mono text-xs uppercase tracking-[0.2em] text-scatter">
//                 Some days are different
//               </p>
//               <h3 className="mt-2 text-lg font-medium">
//                 Tell it how much energy you have
//               </h3>
//               <p className="mt-2 text-sm leading-relaxed text-white/60">
//                 Low energy right now? It&apos;ll hand you the easiest thing
//                 left, not whatever&apos;s next in line.
//               </p>
//             </div>
//             <div>
//               <p className="font-mono text-xs uppercase tracking-[0.2em] text-scatter">
//                 Typing is optional
//               </p>
//               <h3 className="mt-2 text-lg font-medium">Just talk it out</h3>
//               <p className="mt-2 text-sm leading-relaxed text-white/60">
//                 Hold the mic and dump your thoughts out loud instead. It
//                 turns into the same clean list either way.
//               </p>
//             </div>
//           </div>
//         </section>

//         <section className="mx-auto my-28 max-w-2xl px-6 text-center">
//           <h2 className="text-2xl font-medium sm:text-3xl">
//             Nothing gets solved by staring at a list of forty things.
//           </h2>
//           <Link
//             href="/sign-in"
//             className="mt-8 inline-block rounded-full bg-clarity px-8 py-4 text-base font-medium text-clarity-ink shadow-[0_0_40px_-10px_rgba(242,180,65,0.6)] transition-transform hover:scale-105"
//           >
//             Get your one thing
//           </Link>
//         </section>
//       </main>

//       <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-white/30">
//         Tab Zero — one task at a time
//       </footer>
//     </div>
//   );
// }

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ChaosHero } from "@/components/landing/ChaosHero";

const STEPS = [
  {
    label: "Dump",
    body: "Say everything that's stuck in your head, typed or spoken, in whatever order it comes out.",
  },
  {
    label: "Sort",
    body: "Gemini reads the mess and pulls out real tasks — title, category, how long, how much energy.",
  },
  {
    label: "Focus",
    body: "You see exactly one task at a time. Nothing else is on screen until you're ready for it.",
  },
];

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<{ code?: string }>;
}) {
  const { code } = await searchParams;
  const supabase = await createClient();

  // Defensive fallback: if an auth code shows up here instead of at
  // /auth/callback, it means whatever triggered it (email confirmation,
  // password reset, a custom signUp/signIn call, etc.) didn't pass
  // `emailRedirectTo`, so Supabase used the dashboard's default Site
  // URL instead. Rather than leave the user stranded on the landing
  // page with a dead `?code=` in the URL, just exchange it here too.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect("/dump");
    }
    // If the code was invalid/expired, fall through and show the
    // normal landing page rather than getting stuck.
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dump");
  }

  return (
    <div className="min-h-screen bg-ink text-white">
      <header className="mx-auto flex max-w-5xl items-center justify-between px-6 py-6">
        <span className="font-mono text-sm tracking-[0.2em] text-white/60">
          TAB ZERO
        </span>
         <div className="flex items-center gap-3 ">
         <Link
          href="/sign-in"
          className="rounded-full bg-clarity px-5 py-2 text-sm font-medium text-clarity-ink transition-transform hover:scale-105"
        >
          Sign in
        </Link>
        <Link
          href="/sign-up"
          className="rounded-full bg-clarity px-5 py-2 text-sm font-medium text-clarity-ink transition-transform hover:scale-105"
        >
          Sign up
        </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pb-4 pt-8 text-center sm:pt-12">
          <p className="mb-4 font-mono text-xs uppercase tracking-[0.25em] text-scatter">
            for brains that run twelve tabs at once
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-medium leading-tight sm:text-6xl">
            Your head is loud.
            <br />
            <span className="text-white/60">This is the one thing that matters right now.</span>
          </h1>

          <ChaosHero />

          <div className="mx-auto -mt-6 flex max-w-md flex-col items-center gap-4 sm:-mt-10">
            <p className="text-white/60">
              Empty your head into one box. Get back exactly one task, in
              plain language, whenever you&apos;re ready for it.
            </p>
            <Link
              href="/sign-in"
              className="rounded-full bg-clarity px-8 py-4 text-base font-medium text-clarity-ink shadow-[0_0_40px_-10px_rgba(242,180,65,0.6)] transition-transform hover:scale-105"
            >
              Start clearing your head
            </Link>
          </div>
        </section>

        {/* How it works -- a genuine 3-step sequence, so numbering earns its place */}
        <section className="mx-auto mt-28 max-w-5xl px-6">
          <div className="grid gap-8 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.label} className="border-t border-ink-border pt-6">
                <p className="font-mono text-xs text-white/40">0{i + 1}</p>
                <h3 className="mt-2 text-xl font-medium">{step.label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Supporting details, kept quiet and short */}
        <section className="mx-auto mt-24 max-w-5xl px-6">
          <div className="grid gap-6 rounded-[28px] border border-ink-border bg-ink-soft/60 p-8 sm:grid-cols-2">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-scatter">
                Some days are different
              </p>
              <h3 className="mt-2 text-lg font-medium">
                Tell it how much energy you have
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Low energy right now? It&apos;ll hand you the easiest thing
                left, not whatever&apos;s next in line.
              </p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-scatter">
                Typing is optional
              </p>
              <h3 className="mt-2 text-lg font-medium">Just talk it out</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                Hold the mic and dump your thoughts out loud instead. It
                turns into the same clean list either way.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto my-28 max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-medium sm:text-3xl">
            Nothing gets solved by staring at a list of forty things.
          </h2>
          <Link
            href="/sign-in"
            className="mt-8 inline-block rounded-full bg-clarity px-8 py-4 text-base font-medium text-clarity-ink shadow-[0_0_40px_-10px_rgba(242,180,65,0.6)] transition-transform hover:scale-105"
          >
            Get your one thing
          </Link>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-6 pb-10 text-center text-xs text-white/30">
        Tab Zero — one task at a time
      </footer>
    </div>
  );
}