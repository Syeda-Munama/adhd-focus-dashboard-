// import { Suspense } from "react";
// import { SignInForm } from "@/components/shared/SignInForm";

// // SignInForm reads useSearchParams() (for ?next= and ?error=), which
// // requires a Suspense boundary -- otherwise Next.js bails out of
// // static rendering for this page entirely and fails the build. The
// // fallback below is what renders for the brief instant before the
// // client component mounts.
// export default function SignInPage() {
//   return (
//     <Suspense fallback={<SignInFormSkeleton />}>
//       <SignInForm />
//     </Suspense>
//   );
// }

// function SignInFormSkeleton() {
//   return (
//     <div className="w-full max-w-sm animate-pulse rounded-[28px] border border-paper-border bg-paper-card p-6">
//       <div className="mx-auto mb-6 h-5 w-20 rounded bg-paper-border" />
//       <div className="h-12 rounded-[16px] bg-paper-border" />
//       <div className="mt-3 h-11 rounded-full bg-paper-border" />
//     </div>
//   );
// }

import { Suspense } from "react";
import { SignInForm } from "@/components/shared/SignInForm";

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFormSkeleton />}>
      <SignInForm />
    </Suspense>
  );
}

function SignInFormSkeleton() {
  return (
    <div className="w-full max-w-sm animate-pulse rounded-[28px] border border-paper-border bg-paper-card p-6">
      <div className="mx-auto mb-6 h-5 w-20 rounded bg-paper-border" />
      <div className="h-12 rounded-[16px] bg-paper-border" />
      <div className="mt-3 h-12 rounded-[16px] bg-paper-border" />
      <div className="mt-3 h-11 rounded-full bg-paper-border" />
    </div>
  );
}