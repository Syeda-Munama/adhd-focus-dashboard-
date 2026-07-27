import { Suspense } from "react";
import { SignUpForm } from "@/components/shared/SignUpForm";

export default function SignUpPage() {
  return (
    <Suspense fallback={<SignUpFormSkeleton />}>
      <SignUpForm />
    </Suspense>
  );
}

function SignUpFormSkeleton() {
  return (
    <div className="w-full max-w-sm animate-pulse rounded-[28px] border border-paper-border bg-paper-card p-6">
      <div className="mx-auto mb-6 h-5 w-20 rounded bg-paper-border" />

      <div className="h-12 rounded-[16px] bg-paper-border" />

      <div className="mt-3 h-12 rounded-[16px] bg-paper-border" />

      <div className="mt-3 h-11 rounded-full bg-paper-border" />
    </div>
  );
}