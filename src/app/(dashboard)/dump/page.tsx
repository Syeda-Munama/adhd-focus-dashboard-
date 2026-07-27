import { DumpInput } from "@/components/dump/DumpInput";

export default function DumpPage() {
  return (
    <div>
      <h1 className="mb-2 text-center text-2xl font-medium text-ink-text">
        Get it out of your head
      </h1>
      <p className="mb-8 text-center text-ink-text-muted">
        Type it all in, however it comes out. We&apos;ll sort it into tasks.
      </p>
      <DumpInput />
    </div>
  );
}
